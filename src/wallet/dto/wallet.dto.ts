import { IsNumber, IsEmail, Min } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(0)
  amount: number;
}

export class WithdrawDto {
  @IsNumber()
  @Min(0)
  amount: number;
}

export class TransferDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEmail()
  receiverEmail: string;
}
