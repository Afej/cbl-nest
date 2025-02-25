export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum AccountStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  REVERSAL = 'reversal',
}

export enum TransactionStatus {
  COMPLETED = 'completed',
  REVERSED = 'reversed',
  FAILED = 'failed',
}
