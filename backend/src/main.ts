import { Server } from 'http';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

import { ValidationPipe } from './shared/validation.pipe';


import * as config from 'config';

const serverConfig = config.get('server');
const port = process.env.PORT || serverConfig.port;
const mode =   process.env.MODE || serverConfig.mode;
const origin =   process.env.ORIGIN || serverConfig.origin;



async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  logger.log(`process.env: ${process.env}`);

  if (mode === 'development') {
    logger.log(`enableCors in development mode`);
    app.enableCors();
  } else {
    logger.log(`Accepting requests from origin "${origin}" `);
    app.enableCors({
      origin: origin,
    });
  }

  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle('VirusMutationsAI api')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const server = await app.listen(port);
  logger.log('Run on port:' + port);

  process.on('SIGINT', () => {
    logger.log('Got SIGINT. Graceful shutdown ', new Date().toISOString());
    shutdown(server);
  });

  // quit properly on docker stop
  process.on('SIGTERM', () => {
    logger.log('Got SIGTERM. Graceful shutdown ', new Date().toISOString());
    shutdown(server);
  })
}

// shut down server
function shutdown(server: Server): void {
  server.close(err => {
    if (err) {
      console.error(err);
      process.exitCode = 1;
    }
    process.exit();
  });
}

bootstrap();
