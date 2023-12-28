import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Cors } from './lib/Cors';
const port = process.env.PORT || 7010;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  new Cors(app);
  await app.listen(port);
  console.log('Listening on port ' + port + '...');
}
bootstrap();
