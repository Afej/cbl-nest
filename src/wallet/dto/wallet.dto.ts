import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEmail, Min } from 'class-validator';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to deposit',
    example: 1000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class WithdrawDto {
  @ApiProperty({
    description: 'Amount to withdraw',
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class TransferDto {
  @ApiProperty({
    description: 'Amount to transfer',
    example: 750,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Email of the transfer recipient',
    example: 'recipient@example.com',
  })
  @IsEmail()
  receiverEmail: string;
}
