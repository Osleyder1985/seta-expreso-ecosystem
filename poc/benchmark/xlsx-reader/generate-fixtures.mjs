import ExcelJS from 'exceljs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const out = new URL('./fixtures/', import.meta.url);
await mkdir(out, { recursive: true });

async function save(id, build) {
  const wb = new ExcelJS.Workbook();
  await build(wb);
  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  await writeFile(new URL(`${id}.xlsx`, out), buffer);
  return { id, bytes: buffer.length, sha256 };
}

const fixtures = [
  ['F01-minimal', wb => { const s=wb.addWorksheet('Manifest'); s.addRow(['House','Peso','Dirección']); s.addRow(['CACC-00000001',12.5,'CAMAGUEY TEST 1']); }],
  ['F02-textual-house', wb => { const s=wb.addWorksheet('Manifest'); s.addRow(['House','Peso']); s.addRow(['ABC-TEXT-01','12,50']); }],
  ['F03-multiple-physical-unit', wb => { const s=wb.addWorksheet('Manifest'); s.addRow(['House','Unit','Peso']); s.addRows([['H1','U1',5],['H1','U2',7]]); }],
  ['F04-shared-address', wb => { const s=wb.addWorksheet('Manifest'); s.addRows([['House','Peso','Dirección'],['H1',10,'ADDRESS SHARED'],['H2',20,'ADDRESS SHARED']]); }],
  ['F05-multiple-phones', wb => { const s=wb.addWorksheet('Manifest'); s.addRows([['House','Teléfono 1','Teléfono 2'],['H1','555111','555222']]); }],
  ['F06-valid-coordinates', wb => { const s=wb.addWorksheet('Manifest'); s.addRows([['House','Latitud','Longitud'],['H1',21.3808,-77.9169]]); }],
  ['F07-unresolved-coordinates', wb => { const s=wb.addRows ? wb.addWorksheet('Manifest') : null; s.addRows([['House','Latitud','Longitud'],['H1','','']]); }],
  ['F08-aduana-sheet', wb => { wb.addWorksheet('Manifest').addRows([['House','Peso'],['H1',10]]); wb.addWorksheet('Aduana').addRows([['House','Estado'],['H1','PENDIENTE']]); }],
  ['F09-consolidado', wb => { wb.addWorksheet('CONSOLIDADO').addRows([['House','Peso'],['H1',10],['H2',20]]); }],
  ['F10-formula', wb => { const s=wb.addWorksheet('Manifest'); s.addRows([['House','Peso','Total'],['H1',10,{formula:'B2*2',result:20}]]); s.getCell('C2').numFmt='0.00'; }],
  ['F11-totals-discrepancy', wb => { wb.addWorksheet('Manifest').addRows([['House','Peso'],['H1',10],['H2',20],['TOTAL',35]]); }],
  ['F12-header-alias', wb => { const s=wb.addWorksheet('Manifest'); s.addRows([['MANIFIESTO'],['Identificación','Fecha'],['House','Peso KG','Dirección del Destinatario'],['H1',12.5,'ADDRESS TEST']]); }],
  ['F13-ambiguous-header', wb => { wb.addWorksheet('Manifest').addRows([['House','Peso','Peso KG','Dirección'],['H1',10,10,'ADDR']]); }],
  ['F14-missing-critical', wb => { wb.addWorksheet('Manifest').addRows([['House','Peso','Dirección'],['H1','','ADDR']]); }],
  ['F15-extra-column', wb => { wb.addWorksheet('Manifest').addRows([['House','Peso','Dirección','Column Extraña'],['H1',10,'ADDR','X']]); }],
  ['F16-total-subtotal', wb => { wb.addWorksheet('Manifest').addRows([['House','Peso','Dirección'],['H1',10,'ADDR'],['SUBTOTAL',10,''],['TOTAL',10,'']]); }],
  ['F17-problematic-numerics', wb => { wb.addWorksheet('Manifest').addRows([['House','Peso'],['H1','1.234,56'],['H2','N/A']]); }],
  ['F18-ambiguous-identity', wb => { wb.addWorksheet('Manifest').addRows([['House','Nombre','Dirección'],['H1','PERSON A','ADDR'],['H1','PERSON B','ADDR']]); }],
  ['F19-identical-reimport', wb => { wb.addWorksheet('Manifest').addRows([['House','Peso'],['H1',10]]); }],
  ['F20-mapping-profile', wb => { wb.addWorksheet('Manifest').addRows([['Código House','Peso kg'],['H1',10]]); }]
];

const results=[];
for (const [id,build] of fixtures) results.push(await save(id,build));
await writeFile(new URL('manifest.json',out),JSON.stringify({fixtureCount:results.length,fixtures:results},null,2));
console.log(JSON.stringify({fixtureCount:results.length,fixtures:results},null,2));
