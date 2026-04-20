"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const user_module_1 = require("../user/user.module");
const jwt_1 = require("@nestjs/jwt");
const account_module_1 = require("../account/account.module");
const auth_guard_1 = require("src/guards/auth.guard");
const two_factor_module_1 = require("../two_factor/two_factor.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            account_module_1.AccountModule,
            user_module_1.UserModule,
            two_factor_module_1.TwoFactorModule,
            jwt_1.JwtModule.registerAsync({
                useFactory: () => ({
                    secret: process.env.JWT_SECRET,
                    signOptions: {
                        expiresIn: process.env.JWT_EXPIRATION_TIME,
                    },
                }),
            }),
        ],
        providers: [auth_service_1.AuthService, auth_guard_1.AuthGuard],
        controllers: [auth_controller_1.AuthController],
        exports: [jwt_1.JwtModule, auth_service_1.AuthService, auth_guard_1.AuthGuard],
    })
], AuthModule);
