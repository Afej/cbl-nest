import { Injectable } from '@nestjs/common';
import { DepositDto, WithdrawDto, TransferDto, TransactionDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  createTransaction(transactionDto: TransactionDto) {
    const transaction = new this.transactionModel(transactionDto);
    return transaction.save();
  }

  // async findTransactionById(id: string) {
  //   return this.transactionModel
  //     .findById(id)
  //     .populate('userId')
  //     .populate('walletId')
  //     .populate('details.from')
  //     .populate('details.to')
  //     .populate('details.madeBy')
  //     .exec();
  // }

  deposit(depositDto: DepositDto) {}
  withdraw(withdrawDto: WithdrawDto) {}
  transfer(transferDto: TransferDto) {}
  getUserTransactions() {}
  getAllTransactions() {}
  reverseTransaction(id: string) {}
}
