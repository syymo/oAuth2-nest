import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OAuth2Module } from './oauth2/oauth2.module';

@Module({
  imports: [OAuth2Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
