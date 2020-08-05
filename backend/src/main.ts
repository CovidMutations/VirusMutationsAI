import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

import { ValidationPipe } from './shared/validation.pipe';
import * as config from 'config';

const serverConfig = config.get('server');
const port = process.env.PORT || serverConfig.port;
const mode =  serverConfig.mode || process.env.MODE;

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  if (mode === 'development') {
    logger.log(`enableCors in development mode`);
    app.enableCors();
  } else {
    logger.log(`Accepting requests from origin "${serverConfig.origin}" `);
    app.enableCors({
      origin: serverConfig.origin,
    });
  }

  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle('VirusMutationsAI api')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  logger.log('Run on port:' + port);

}
bootstrap();
