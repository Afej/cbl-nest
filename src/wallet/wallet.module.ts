import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [
    WalletService,
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
  ],
})
export class WalletModule {}
