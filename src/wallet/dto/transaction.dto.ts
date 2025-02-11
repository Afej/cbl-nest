import { IsNumber, Min, IsString, IsEnum, IsBoolean } from 'class-validator';

export class TransactionDetailsDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  from?: string;

  @IsString()
  to?: string;

  @IsString()
  madeBy?: string;

  @IsString()
  description?: string;

  @IsBoolean()
  success?: boolean;
}

export class TransactionDto {
  @IsString()
  userId: string;

  @IsString()
  walletId: string;

  @IsEnum(['deposit', 'withdrawal', 'transfer', 'reversal'])
  type: string;

  details: TransactionDetailsDto;
}
