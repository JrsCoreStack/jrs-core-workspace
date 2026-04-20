"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // CORS — permite o frontend em desenvolvimento
    app.enableCors({
        origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    // Swagger
    const config = new swagger_1.DocumentBuilder()
        .setTitle('JRS ERP API')
        .setDescription('Documentação automática da API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    swagger_1.SwaggerModule.setup('api', app, swagger_1.SwaggerModule.createDocument(app, config));
    const port = process.env.PORT ?? 8081;
    await app.listen(port);
    console.log(`🚀 JRS ERP API rodando em http://localhost:${port}`);
    console.log(`📖 Swagger disponível em http://localhost:${port}/api`);
}
void bootstrap();
