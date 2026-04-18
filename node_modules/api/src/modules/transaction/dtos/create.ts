import { IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from 'src/utils/enums/payment_method';
import { TransactionStatus } from 'src/utils/enums/transaction_status';

export class CreateTransactionDTO {
  @IsString()
  @IsUUID()
  event_id: string;
  @IsUUID()
  bank_id: string;
  @IsNumber()
  sale_id: number;
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;
  @IsNumber()
  payment_installments: number;
  @IsString()
  payment_id: string;
  @IsEnum(TransactionStatus)
  payment_status: TransactionStatus;
  @IsNumber()
  total: number;
  created_at: Date;
  updated_at: Date;
}
