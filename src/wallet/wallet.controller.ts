import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Role } from 'src/common';
import { DepositDto, WithdrawDto, TransferDto } from './dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('wallet')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.User)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  deposit(@Body() depositDto: DepositDto) {
    return this.walletService.deposit(depositDto);
  }

  @Post('withdraw')
  withdraw(@Body() withdrawDto: WithdrawDto) {
    return this.walletService.withdraw(withdrawDto);
  }

  @Post('transfer')
  transfer(@Body() transferDto: TransferDto) {
    return this.walletService.transfer(transferDto);
  }

  @Get('transactions')
  getUserTransactions() {
    return this.walletService.getUserTransactions();
  }

  @Get('transactions/all')
  @Roles(Role.Admin)
  getAllTransactions() {
    return this.walletService.getAllTransactions();
  }

  @Put('transactions/:id/reverse')
  @Roles(Role.Admin)
  reverseTransaction(@Param('id') id: string) {
    return this.walletService.reverseTransaction(id);
  }
}
