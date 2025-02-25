import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsString, IsEnum, IsBoolean } from 'class-validator';
import { TransactionStatus, TransactionType } from '../../common';

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
    description: 'Transaction success status',
    example: true,
  })
  @IsBoolean()
  success?: boolean;

  @ApiProperty({
    description: 'Original transaction reference for reversals',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  originalTransactionId?: string;
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
    enum: TransactionType,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction status',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({
    description: 'Transaction details',
    type: TransactionDetailsDto,
  })
  details: TransactionDetailsDto;
}
