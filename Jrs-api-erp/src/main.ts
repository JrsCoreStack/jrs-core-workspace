import './register-path-aliases';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — permite o frontend em desenvolvimento
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('JRS ERP API')
    .setDescription('Documentação automática da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 8081;
  await app.listen(port);
  console.log(`🚀 JRS ERP API rodando em http://localhost:${port}`);
  console.log(`📖 Swagger disponível em http://localhost:${port}/api`);
}
void bootstrap();
