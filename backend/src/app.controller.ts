import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'VICMAN POS Backend',
      message: 'Backend is running',
    };
  }

  @Get('api/health')
  apiHealthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'VICMAN POS API',
    };
  }

  @Get('auth/db-test')
  async testDatabase() {
    try {
      const userCount = await this.prisma.user.count();
      const roleCount = await this.prisma.role.count();

      return {
        status: 'ok',
        database: 'connected',
        userCount,
        roleCount,
        message: 'Database is accessible'
      };
    } catch (error: any) {
      return {
        status: 'error',
        database: 'disconnected',
        message: error.message,
        note: 'Hardcoded credentials still work!'
      };
    }
  }
}
