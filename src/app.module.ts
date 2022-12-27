import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
      //Belirtilen guardı, tüm applikasyonda aktif eder. Tüm controller ve endpointler, bu guard tarafından korunur. Ayrıca guard için `Reflector`ı otomatik olarak inject eder
    },
  ],
})
export class AppModule {}
