import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { cnpj } from 'cpf-cnpj-validator';

@ValidatorConstraint({ name: 'isCnpjValid', async: false })
export class IsCnpjValid implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return cnpj.isValid(value);
  }

  defaultMessage(): string {
    return 'CNPJ inválido';
  }
}