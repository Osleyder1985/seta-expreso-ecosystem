import {BadRequestException,Injectable,NotFoundException} from '@nestjs/common';
type P={id:number;house:string;weightKg:number;recipientAddress:string;createdAt:string;updatedAt:string};
@Injectable() export class PackagesService {
 private data=new Map<number,P>(); private nextId=1;
 create(x:any){if(x.weightKg<0)throw new BadRequestException('weightKg must be >= 0');const now=new Date().toISOString();const p={id:this.nextId++, ...x,createdAt:now,updatedAt:now};this.data.set(p.id,p);return p;}
 findAll(){return [...this.data.values()];} findOne(id:number){const p=this.data.get(id);if(!p)throw new NotFoundException('Package not found');return p;}
 update(id:number,x:any){const p=this.findOne(id);const n={...p,...x,updatedAt:new Date().toISOString()};this.data.set(id,n);return n;}
 remove(id:number){this.findOne(id);this.data.delete(id);return {deleted:true};}
 transactionProbe(){return {transaction:true,provider:'postgresql-contract-placeholder'};}
}