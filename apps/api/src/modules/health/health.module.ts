import { Controller, Get, Module } from '@nestjs/common';
import { Public } from '../auth/guards/public.decorator';

@Controller('health')
class HealthController {
  @Public()
  @Get()
  getHealth(): { status: 'ok'; service: string } {
    return {
      status: 'ok',
      service: 'seta-expreso-api',
    };
  }
}

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
