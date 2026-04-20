"use client";

import React from "react"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Ticket,
  Loader2,
  ArrowLeft,
  Building2,
  UserPlus,
  Shield,
  CheckCircle2,
} from "lucide-react";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const departments = [
  { value: "comercial", label: "Comercial" },
  { value: "financeiro", label: "Financeiro" },
  { value: "operacoes", label: "Operações" },
  { value: "marketing", label: "Marketing" },
  { value: "ti", label: "TI" },
  { value: "rh", label: "Recursos Humanos" },
  { value: "suporte", label: "Suporte" },
];

const roles = [
  { value: "admin", label: "Administrador" },
  { value: "gerente", label: "Gerente" },
  { value: "analista", label: "Analista" },
  { value: "operador", label: "Operador" },
  { value: "visualizador", label: "Visualizador" },
];

const accounts = [
  { value: "jrs-external-sales", label: "Vendas — projeto integrado" },
  { value: "play", label: "OTicket Play" },
  { value: "ambos", label: "Ambos" },
];

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cpf: "",
    phone: "",
    department: "",
    role: "",
    account: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isStep1Valid =
    formData.fullName && formData.email && formData.cpf && formData.phone;
  const isStep2Valid = formData.department && formData.role && formData.account;
  const isStep3Valid =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    formData.acceptTerms;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardContent className="pt-10 pb-10">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Cadastro enviado!</h2>
            <p className="text-muted-foreground mb-6">
              Seu cadastro foi enviado para aprovação. Você receberá um e-mail
              quando sua conta for ativada.
            </p>
            <Button onClick={onSwitchToLogin} className="w-full">
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary/20 via-background to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Ticket className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">OTicket</h1>
              <p className="text-sm text-muted-foreground">Grupo</p>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-foreground leading-tight text-balance">
              Cadastro de Colaboradores
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Solicite seu acesso ao sistema ERP do Grupo OTicket.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Dados Pessoais</h3>
                  <p className="text-sm text-muted-foreground">
                    Informe seus dados para identificacao
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Departamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecione sua area de atuacao
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Seguranca</h3>
                  <p className="text-sm text-muted-foreground">
                    Crie uma senha segura para sua conta
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Apos o cadastro, aguarde a aprovacao do administrador.
          </p>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-lg border-border bg-card">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <button
                onClick={onSwitchToLogin}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <div className="flex items-center gap-2 lg:hidden">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">OTicket</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold pt-4">
              Solicitar Cadastro
            </CardTitle>
            <CardDescription>
              Preencha os dados para solicitar acesso ao sistema
            </CardDescription>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 pt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-1 rounded ${
                        step > s ? "bg-primary" : "bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Dados</span>
              <span>Cargo</span>
              <span>Senha</span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      placeholder="Digite seu nome completo"
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail Corporativo</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@oticket.com.br"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => updateFormData("cpf", e.target.value)}
                        required
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        required
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    disabled={!isStep1Valid}
                    onClick={() => setStep(2)}
                  >
                    Continuar
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => updateFormData("department", value)}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Cargo/Funcao</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => updateFormData("role", value)}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Conta/Produto</Label>
                    <Select
                      value={formData.account}
                      onValueChange={(value) => updateFormData("account", value)}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.value} value={acc.value}>
                            {acc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Qual produto voce ira gerenciar
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setStep(1)}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      disabled={!isStep2Valid}
                      onClick={() => setStep(3)}
                    >
                      Continuar
                    </Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Crie uma senha forte"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        required
                        className="bg-secondary border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimo 8 caracteres, com letras e numeros
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          updateFormData("confirmPassword", e.target.value)
                        }
                        required
                        className="bg-secondary border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword &&
                      formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-destructive">
                          As senhas nao coincidem
                        </p>
                      )}
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) =>
                        updateFormData("acceptTerms", checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal leading-snug cursor-pointer"
                    >
                      Concordo com os{" "}
                      <span className="text-primary hover:underline">
                        Termos de Uso
                      </span>{" "}
                      e{" "}
                      <span className="text-primary hover:underline">
                        Politica de Privacidade
                      </span>
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setStep(2)}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!isStep3Valid || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Solicitar Acesso"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
