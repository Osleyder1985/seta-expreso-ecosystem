import { Controller, Get, Module } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/guards/public.decorator';

@ApiTags('Health')
@Controller('health')
class HealthController {
  @Public()
  @ApiOperation({ summary: 'Return API health status' })
  @ApiOkResponse({ description: 'API is healthy.', schema: { type: 'object', required: ['status', 'service'], properties: { status: { type: 'string', enum: ['ok'] }, service: { type: 'string' } } } })
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
