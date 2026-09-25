import { Controller, Get, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Controller('health')
export class HealthController implements OnModuleDestroy {
  private readonly pool = new Pool({ connectionString: process.env.DATABASE_URL });

  @Get()
  async health() {
    await this.pool.query('SELECT 1');
    return { status: 'ok', database: 'ok' };
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
