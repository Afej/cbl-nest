import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DepositDto, WithdrawDto, TransferDto, TransactionDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { PaginatedResponse } from 'src/common';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Wallet.name)
    private walletModel: Model<WalletDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  createTransaction(transactionDto: TransactionDto) {
    const transaction = new this.transactionModel(transactionDto);
    return transaction.save();
  }

  async getUserWallet(userId: string) {
    const wallet = await this.walletModel.findOne({ userId }).lean().exec();

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this user');
    }

    return wallet;
  }

  async deposit(userId: string, depositDto: DepositDto) {
    const { amount } = depositDto;

    // Get user wallet
    const wallet = await this.getUserWallet(userId);

    // Update balance
    const updatedWallet = await this.walletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true },
    );

    const transactionDetails = {
      amount,
      madeBy: userId,
      description: 'Deposit',
      success: true,
    };

    // Create transaction record
    await this.createTransaction({
      userId,
      walletId: wallet._id.toString(),
      type: 'deposit',
      details: transactionDetails,
    });

    return updatedWallet;
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    const { amount } = withdrawDto;

    // Get user wallet
    const wallet = await this.getUserWallet(userId);

    // Check sufficient balance
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Update balance
    const updatedWallet = await this.walletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: -amount } },
      { new: true },
    );

    const transactionDetails = {
      amount,
      madeBy: userId,
      description: 'Deposit',
      success: true,
    };

    // Create transaction record
    await this.createTransaction({
      userId,
      walletId: wallet._id.toString(),
      type: 'withdrawal',
      details: transactionDetails,
    });

    return updatedWallet;
  }

  async transfer(userId: string, transferDto: TransferDto) {
    const { amount, receiverEmail } = transferDto;

    // Get user and receiver info
    const receiver = await this.userModel.findOne({ email: receiverEmail });

    if (!receiver) {
      throw new NotFoundException(`User not found with email ${receiverEmail}`);
    }

    // Prevent self-transfer
    if (receiverEmail === userId) {
      throw new BadRequestException('Cannot transfer to your own account');
    }

    // Get both wallets
    const senderWallet = await this.getUserWallet(userId);
    const receiverWallet = await this.getUserWallet(receiver._id.toString());

    // Check sufficient balance
    if (senderWallet.balance < amount) {
      throw new BadRequestException(
        'Insufficient wallet balance to make transfer',
      );
    }

    // Update sender wallet (deduct amount)
    await this.walletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: -amount } },
      { new: true },
    );

    // Update receiver wallet (add amount)
    await this.walletModel.findOneAndUpdate(
      { userId: receiver._id },
      { $inc: { balance: amount } },
      { new: true },
    );

    // Record deposit transaction for receiver
    await this.createTransaction({
      userId: receiver._id.toString(),
      walletId: receiverWallet._id.toString(),
      type: 'deposit',
      details: {
        from: userId,
        amount,
        success: true,
      },
    });

    // Record transfer transaction for sender
    const transferTransaction = await this.createTransaction({
      userId,
      walletId: senderWallet._id.toString(),
      type: 'transfer',
      details: {
        from: userId,
        to: receiver._id.toString(),
        amount,
        success: true,
      },
    });

    return transferTransaction;
  }

  async getUserTransactions(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Transaction>> {
    const skip = (page - 1) * limit;

    const wallet = await this.getUserWallet(userId);

    const query = this.transactionModel
      .find({ walletId: wallet._id })
      .skip(skip)
      .limit(limit);

    const total = await this.transactionModel.countDocuments({
      walletId: wallet._id,
    });
    const transactions = await query.lean().exec();
    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getAllTransactions(
    page = 1,
    limit = 10,
    populateRelations = true,
  ): Promise<PaginatedResponse<Transaction>> {
    const skip = (page - 1) * limit;
    const query = this.transactionModel.find().skip(skip).limit(limit);

    if (populateRelations) {
      query.populate('userId').populate('walletId');
    }
    const total = await this.transactionModel.countDocuments();
    const transactions = await query.lean().exec();

    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getTransaction(
    id: string,
    populateRelations = true,
  ): Promise<Transaction> {
    const query = this.transactionModel.findById(id);

    if (populateRelations) {
      query.populate('userId').populate('walletId');
    }

    const transaction = await query.lean().exec();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async reverseTransaction(transactionId: string) {
    const transaction = await this.getTransaction(transactionId);

    if (transaction.type !== 'transfer') {
      throw new BadRequestException(
        'Only transfer transactions can be reversed',
      );
    }

    const { from, to, amount } = transaction.details;

    const senderId = from as unknown as string;
    const receiverId = to as unknown as string;

    // Check if transaction details are valid
    if (!senderId || !receiverId || !amount) {
      throw new BadRequestException('Invalid transaction details');
    }

    // Get both wallets
    const senderWallet = await this.getUserWallet(senderId);
    const receiverWallet = await this.getUserWallet(receiverId);

    // Update sender wallet (add amount back)
    await this.walletModel.findOneAndUpdate(
      { userId: senderId },
      { $inc: { balance: amount } },
      { new: true },
    );

    // Update receiver wallet (deduct amount)
    await this.walletModel.findOneAndUpdate(
      { userId: receiverId },
      { $inc: { balance: -amount } },
      { new: true },
    );

    // Record reversal transactions
    await this.createTransaction({
      userId: senderId,
      walletId: senderWallet._id.toString(),
      type: 'reversal',
      details: {
        amount,
        description: `Transfer reversal of amount +${amount}`,
        success: true,
      },
    });

    await this.createTransaction({
      userId: receiverId,
      walletId: receiverWallet._id.toString(),
      type: 'reversal',
      details: {
        amount,
        description: `Transfer reversal of amount -${amount}`,
        success: true,
      },
    });

    // Update original transaction type to prevent multiple reversals
    const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
      transactionId,
      { type: 'reversal' },
      { new: true },
    );

    return updatedTransaction;
  }
}
