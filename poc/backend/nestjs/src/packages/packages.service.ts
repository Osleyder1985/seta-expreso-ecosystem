import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

type PackageRow = { id:number; house:string; weightKg:number; recipientAddress:string; createdAt:string; updatedAt:string; };

@Injectable()
export class PackagesService implements OnModuleDestroy {
  private readonly pool = new Pool({ connectionString: process.env.DATABASE_URL });

  async create(x:any):Promise<PackageRow>{
    const c=await this.pool.connect();
    try{await c.query('BEGIN');const r=await c.query('INSERT INTO packages(house,weight_kg,recipient_address) VALUES($1,$2,$3) RETURNING id,house,weight_kg AS "weightKg",recipient_address AS "recipientAddress",created_at AS "createdAt",updated_at AS "updatedAt"',[x.house,x.weightKg,x.recipientAddress]);await c.query('COMMIT');return r.rows[0];}
    catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
  }

  async findAll(){return (await this.pool.query('SELECT id,house,weight_kg AS "weightKg",recipient_address AS "recipientAddress",created_at AS "createdAt",updated_at AS "updatedAt" FROM packages ORDER BY id')).rows;}

  async findOne(id:number){const r=await this.pool.query('SELECT id,house,weight_kg AS "weightKg",recipient_address AS "recipientAddress",created_at AS "createdAt",updated_at AS "updatedAt" FROM packages WHERE id=$1',[id]);if(!r.rows[0])throw new NotFoundException('Package not found');return r.rows[0];}

  async update(id:number,x:any){const r=await this.pool.query('UPDATE packages SET house=COALESCE($2,house),weight_kg=COALESCE($3,weight_kg),recipient_address=COALESCE($4,recipient_address),updated_at=now() WHERE id=$1 RETURNING id,house,weight_kg AS "weightKg",recipient_address AS "recipientAddress",created_at AS "createdAt",updated_at AS "updatedAt"',[id,x.house,x.weightKg,x.recipientAddress]);if(!r.rows[0])throw new NotFoundException('Package not found');return r.rows[0];}

  async remove(id:number){const r=await this.pool.query('DELETE FROM packages WHERE id=$1',[id]);if(r.rowCount!==1)throw new NotFoundException('Package not found');return {deleted:true};}

  async onModuleDestroy(){await this.pool.end();}
}