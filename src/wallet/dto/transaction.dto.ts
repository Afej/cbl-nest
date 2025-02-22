import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsString, IsEnum, IsBoolean } from 'class-validator';

export class TransactionDetailsDto {
  @ApiProperty({
    description: 'Transaction amount',
    example: 1000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Sender identifier',
    example: 'user123',
  })
  @IsString()
  from?: string;

  @ApiProperty({
    description: 'Recipient identifier',
    example: 'user456',
  })
  @IsString()
  to?: string;

  @ApiProperty({
    description: 'User who initiated the transaction',
    example: 'user123',
  })
  @IsString()
  madeBy?: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Payment for services',
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Transaction status',
    example: true,
  })
  @IsBoolean()
  success?: boolean;
}

export class TransactionDto {
  @ApiProperty({
    description: 'User identifier',
    example: 'user123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Wallet identifier',
    example: 'wallet123',
  })
  @IsString()
  walletId: string;

  @ApiProperty({
    description: 'Type of transaction',
    enum: ['deposit', 'withdrawal', 'transfer', 'reversal'],
  })
  @IsEnum(['deposit', 'withdrawal', 'transfer', 'reversal'])
  type: string;

  @ApiProperty({
    description: 'Transaction details',
    type: TransactionDetailsDto,
  })
  details: TransactionDetailsDto;
}
