import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(SeederModule);
  const seeder = app.get(SeederService);

  await seeder.seedAdmin();

  await app.close();
  process.exit(0);
}

void bootstrap();
