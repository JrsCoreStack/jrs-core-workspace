import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { cpf } from 'cpf-cnpj-validator';

@ValidatorConstraint({ name: 'isCpfValid', async: false })
export class IsCpfValid implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return cpf.isValid(value);
  }

  defaultMessage(): string {
    return 'CPF inválido';
  }
}