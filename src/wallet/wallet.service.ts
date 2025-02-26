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
import { User, UserDocument } from '../user/schemas/user.schema';
import {
  PaginatedResponse,
  TransactionStatus,
  TransactionType,
} from '../common';
import {
  GetUserTransactionsParams,
  TransactionFilters,
  TransactionQueryFilters,
} from './types';

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

    // Get user wallet and user details
    const wallet = await this.getUserWallet(userId);
    const user = await this.userModel.findById(userId);

    // Update balance
    const updatedWallet = await this.walletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true },
    );

    const transactionDetails = {
      amount: Math.abs(amount),
      madeBy: userId,
      description: `Deposit by ${user?.email || 'user'}`,
      success: true,
    };

    // Create transaction record
    await this.createTransaction({
      userId,
      walletId: wallet._id.toString(),
      type: TransactionType.DEPOSIT,
      details: transactionDetails,
    });

    return updatedWallet;
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    const { amount } = withdrawDto;

    // Get user wallet and user details
    const wallet = await this.getUserWallet(userId);
    const user = await this.userModel.findById(userId);

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
      amount: -Math.abs(amount),
      madeBy: userId,
      description: `Withdrawal by ${user?.email || 'user'}`,
      success: true,
    };

    // Create transaction record
    await this.createTransaction({
      userId,
      walletId: wallet._id.toString(),
      type: TransactionType.WITHDRAWAL,
      details: transactionDetails,
    });

    return updatedWallet;
  }

  async transfer(userId: string, transferDto: TransferDto) {
    const { amount, receiverEmail } = transferDto;

    // Get user and receiver info
    const receiver = await this.userModel.findOne({ email: receiverEmail });
    const sender = await this.userModel.findById(userId);

    if (!receiver) {
      throw new NotFoundException(`User not found with email ${receiverEmail}`);
    }

    if (!sender) {
      throw new NotFoundException(`Sender not found`);
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
      type: TransactionType.DEPOSIT,
      details: {
        from: userId,
        amount: Math.abs(amount),
        success: true,
        description: `Received transfer from ${sender.email}`,
      },
    });

    // Record transfer transaction for sender
    const transferTransaction = await this.createTransaction({
      userId,
      walletId: senderWallet._id.toString(),
      type: TransactionType.TRANSFER,
      details: {
        from: userId,
        to: receiver._id.toString(),
        amount: -Math.abs(amount),
        success: true,
        description: `Transfer to ${receiverEmail}`,
      },
    });

    return transferTransaction;
  }

  async getUserTransactions({
    userId,
    page = 1,
    limit = 10,
    type,
    status,
  }: GetUserTransactionsParams): Promise<PaginatedResponse<Transaction>> {
    const skip = (page - 1) * limit;

    const wallet = await this.getUserWallet(userId);

    const filterQuery: TransactionQueryFilters = {
      walletId: wallet._id,
    };

    if (type) {
      filterQuery.type = type;
    }

    if (status) {
      filterQuery.status = status;
    }

    const query = this.transactionModel
      .find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.transactionModel.countDocuments(filterQuery);
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

  private async buildTransactionFilters(
    filters: TransactionFilters,
  ): Promise<TransactionQueryFilters> {
    const queryFilters: TransactionQueryFilters = {};

    if (filters.type) {
      queryFilters.type = filters.type;
    }

    if (filters.status) {
      queryFilters.status = filters.status;
    }

    if (filters.search) {
      const users = await this.userModel.find({
        $or: [
          { email: { $regex: filters.search, $options: 'i' } },
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
        ],
      });

      const userIds = users.map((user) => user._id);
      queryFilters.userId = { $in: userIds };
    }

    return queryFilters;
  }

  async getAllTransactions({
    page = 1,
    limit = 10,
    type,
    status,
    search,
    populateRelations = true,
  }: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const skip = (page - 1) * limit;
    const filterQuery = await this.buildTransactionFilters({
      type,
      status,
      search,
    });

    const query = this.transactionModel
      .find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (populateRelations) {
      query.populate('userId').populate('walletId');
    }

    const total = await this.transactionModel.countDocuments(filterQuery);
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
    const originalTransaction = await this.getTransaction(transactionId);

    if (originalTransaction.type !== TransactionType.TRANSFER) {
      throw new BadRequestException(
        'Only transfer transactions can be reversed',
      );
    }

    if (originalTransaction.status === TransactionStatus.REVERSED) {
      throw new BadRequestException('Transaction already reversed');
    }

    const { from, to, amount } = originalTransaction.details;
    const senderId = from as unknown as string;
    const receiverId = to as unknown as string;

    // Get users for better descriptions
    const sender = await this.userModel.findById(senderId);
    const receiver = await this.userModel.findById(receiverId);

    // Get wallets
    const senderWallet = await this.getUserWallet(senderId);
    const receiverWallet = await this.getUserWallet(receiverId);

    // Update balances
    await this.walletModel.findOneAndUpdate(
      { userId: senderId },
      { $inc: { balance: Math.abs(amount) } },
    );

    await this.walletModel.findOneAndUpdate(
      { userId: receiverId },
      { $inc: { balance: -Math.abs(amount) } },
    );

    // Create reversal records
    await this.createTransaction({
      userId: senderId,
      walletId: senderWallet._id.toString(),
      type: TransactionType.REVERSAL,
      details: {
        amount: Math.abs(amount),
        originalTransactionId: transactionId,
        description: `Reversal: Refund received from ${receiver?.email || 'user'}`,
        success: true,
      },
    });

    await this.createTransaction({
      userId: receiverId,
      walletId: receiverWallet._id.toString(),
      type: TransactionType.REVERSAL,
      details: {
        amount: -Math.abs(amount),
        originalTransactionId: transactionId,
        description: `Reversal: Refund sent to ${sender?.email || 'user'}`,
        success: true,
      },
    });

    // Mark original as reversed
    await this.transactionModel.findByIdAndUpdate(transactionId, {
      status: TransactionStatus.REVERSED,
    });
  }
}
