import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const root = path.resolve(import.meta.dirname, "../..");
const args = Object.fromEntries(process.argv.slice(2).map(x => {
  const [k,v] = x.replace(/^--/,"").split("=");
  return [k, Number.isNaN(Number(v)) ? v : Number(v)];
}));
const repetitions = args.repetitions ?? 5;
const requestsPerOperation = args.requests ?? 200;
const concurrency = args.concurrency ?? 16;
const warmupRequests = args.warmup ?? 100;
const allowUnlocked = args["allow-unlocked-dependencies"] === true || args["allow-unlocked-dependencies"] === "true";
const stamp = new Date().toISOString().replace(/[:.]/g,"-");
const outDir = path.join(root,"artifacts","benchmark",stamp);
fs.mkdirSync(outDir,{recursive:true});

function run(cmd, argv=[], opts={}) {
  return execFileSync(cmd, argv, {cwd:root, encoding:"utf8", stdio:opts.stdio ?? ["ignore","pipe","pipe"], ...opts}).trim();
}
function tryRun(cmd, argv=[]) {
  try { return run(cmd,argv); } catch { return null; }
}
function ms(){return performance.now();}
function percentile(a,p){ if(!a.length)return null; const s=[...a].sort((x,y)=>x-y); const i=(s.length-1)*p; const lo=Math.floor(i),hi=Math.ceil(i); return lo===hi?s[lo]:s[lo]+(s[hi]-s[lo])*(i-lo); }
function stats(a){return {count:a.length,min_ms:Math.min(...a),mean_ms:a.reduce((x,y)=>x+y,0)/a.length,p50_ms:percentile(a,.5),p95_ms:percentile(a,.95),max_ms:Math.max(...a)};}
function write(name,obj){fs.writeFileSync(path.join(outDir,name),JSON.stringify(obj,null,2)+"\n");}

const env = {
  captured_at:new Date().toISOString(),
  os:{platform:process.platform,release:os.release(),arch:process.arch,cpu_model:os.cpus()[0]?.model,cpu_logical_cores:os.cpus().length,total_memory_bytes:os.totalmem()},
  powershell:tryRun("powershell.exe",["-NoProfile","-Command","(Get-CimInstance Win32_OperatingSystem).Caption + ' ' + (Get-CimInstance Win32_OperatingSystem).Version"]),
  gpu:tryRun("powershell.exe",["-NoProfile","-Command","(Get-CimInstance Win32_VideoController | Select-Object -First 1 Name,AdapterRAM | ConvertTo-Json -Compress"]),
  docker:tryRun("docker",["--version"]),
  compose:tryRun("docker",["compose","version"]),
  node:tryRun("node",["--version"]),
  npm:tryRun("npm",["--version"]),
  dotnet:tryRun("dotnet",["--version"]),
  git_commit:tryRun("git",["rev-parse","HEAD"]),
  git_branch:tryRun("git",["branch","--show-current"])
};
write("environment.json",env);

const lock = path.join(root,"poc/backend/nestjs/package-lock.json");
if(!fs.existsSync(lock) && !allowUnlocked){
  write("status.json",{status:"BLOCKED",reason:"Missing poc/backend/nestjs/package-lock.json",required_action:"Generate and commit package-lock.json before a reproducible benchmark. Use -AllowUnlockedDependencies only for a non-reproducible diagnostic run."});
  console.error("BLOCKED: NestJS package-lock.json is missing. Reproducible benchmark cannot proceed.");
  process.exit(2);
}

const stacks=[
 {name:"nestjs",dir:"poc/backend/nestjs",port:3000,base:"http://127.0.0.1:3000"},
 {name:"aspnet-core",dir:"poc/backend/aspnet-core",port:8081,base:"http://127.0.0.1:8081"}
];

function compose(stack,...a){return run("docker",["compose","-f",path.join(root,stack.dir,"docker-compose.yml"),"-p","seta-bench-"+stack.name,...a]);}
async function waitHealth(base,timeout=120000){
 const start=Date.now();
 while(Date.now()-start<timeout){
   try { const r=await fetch(base+"/health"); if(r.ok)return Date.now()-start; } catch {}
   await new Promise(r=>setTimeout(r,500));
 }
 throw new Error("Readiness timeout: "+base);
}
async function request(base,op){
 const id="bench-"+Math.random().toString(36).slice(2);
 let method="GET",url=base+"/packages",body;
 if(op==="create"){method="POST";body={house:id,weightKg:2.5,recipientAddress:"Camagüey"};}
 const t=ms();
 const r=await fetch(url,{method,headers:{"content-type":"application/json"},body:body?JSON.stringify(body):undefined});
 const latency=ms()-t;
 let json=null;try{json=await r.json()}catch{}
 if(op==="create" && r.ok && json?.id) return {latency,status:r.status,id:json.id};
 return {latency,status:r.status};
}
async function runOp(base,op,n,c){
 const results=[];let next=0;
 async function worker(){
   while(true){const i=next++;if(i>=n)return;try{results[i]=await request(base,op)}catch(e){results[i]={error:String(e)}}}
 }
 await Promise.all(Array.from({length:Math.min(c,n)},worker));
 return results;
}
async function sampleStats(container, samples){
 const out=[];
 for(let i=0;i<samples;i++){
   const raw=tryRun("docker",["stats","--no-stream","--format","{{json .}}",container]);
   if(raw) {try{out.push(JSON.parse(raw))}catch{}}
   await new Promise(r=>setTimeout(r,250));
 }
 return out;
}

const all={protocol:"backend-benchmark-protocol-v0.2.0",configuration:{repetitions,requests_per_operation:requestsPerOperation,concurrency,warmup_requests:warmupRequests},environment:env,stacks:[]};
for(const stack of stacks){
 console.log("\n== "+stack.name+" ==");
 const record={name:stack.name,dir:stack.dir};
 const composeProject="seta-bench-"+stack.name;
 try { compose(stack,"down","-v","--remove-orphans"); } catch {}
 const buildStart=ms(); compose(stack,"build","--pull"); record.build_ms=ms()-buildStart;
 compose(stack,"up","-d","--force-recreate");
 record.readiness_ms=await waitHealth(stack.base);
 const ps=JSON.parse(run("docker",["compose","-f",path.join(root,stack.dir,"docker-compose.yml"),"-p",composeProject,"ps","--format","json"]));
 record.containers=ps;
 const apiContainer=ps.find(x=>String(x.Service||"").toLowerCase()==="api")?.Name;
 record.warmup=await runOp(stack.base,"create",warmupRequests,concurrency);
 const measurements=[];
 for(let rep=1;rep<=repetitions;rep++){
   const sample={repetition:rep,operations:{}};
   for(const op of ["create","get","list"]){
     if(op==="get"){
       const created=await runOp(stack.base,"create",Math.min(20,concurrency),concurrency);
       const ids=created.map(x=>x.id).filter(Boolean);
       const lats=[];const errs=[];
       await Promise.all(ids.map(async id=>{const t=ms();try{const r=await fetch(stack.base+"/packages/"+id);lats.push(ms()-t);if(!r.ok)errs.push(r.status)}catch(e){errs.push(String(e))}}));
       sample.operations.get={stats:stats(lats),errors:errs.length};
     } else {
       const rr=await runOp(stack.base,op,requestsPerOperation,concurrency);
       const lats=rr.filter(x=>!x.error).map(x=>x.latency);
       sample.operations[op]={stats:stats(lats),errors:rr.length-lats.length,non_2xx:rr.filter(x=>x.status<200||x.status>=300).length};
     }
   }
   sample.stats_samples=apiContainer?await sampleStats(apiContainer,4):[];
   measurements.push(sample);
 }
 record.measurements=measurements;
 compose(stack,"down","-v","--remove-orphans");
 all.stacks.push(record);
 write(stack.name+".json",record);
}
write("results.json",all);
write("status.json",{status:"COMPLETED",artifact_directory:outDir});
console.log("\nBenchmark completed: "+outDir);
