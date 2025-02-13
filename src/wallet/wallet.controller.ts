import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Role } from 'src/common';
import { DepositDto, WithdrawDto, TransferDto } from './dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuardRequest } from 'src/auth/guards/types';

@Controller('wallet')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.User)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getUserWallet(@Request() req: AuthGuardRequest) {
    const userId = req.user._id.toString();

    return this.walletService.getUserWallet(userId);
  }

  @Post('deposit')
  deposit(@Request() req: AuthGuardRequest, @Body() depositDto: DepositDto) {
    const userId = req.user._id.toString();

    return this.walletService.deposit(userId, depositDto);
  }

  @Post('withdraw')
  withdraw(@Request() req: AuthGuardRequest, @Body() withdrawDto: WithdrawDto) {
    const userId = req.user._id.toString();

    return this.walletService.withdraw(userId, withdrawDto);
  }

  @Post('transfer')
  transfer(@Request() req: AuthGuardRequest, @Body() transferDto: TransferDto) {
    const userId = req.user._id.toString();

    return this.walletService.transfer(userId, transferDto);
  }

  @Get('transactions')
  getUserTransactions(
    @Request() req: AuthGuardRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
  ) {
    const userId = req.user._id.toString();

    return this.walletService.getUserTransactions(userId, page, limit);
  }

  @Roles(Role.Admin)
  @Get('transactions/all')
  getAllTransactions(
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
  ) {
    return this.walletService.getAllTransactions(page, limit);
  }

  @Roles(Role.Admin)
  @Get('transactions/:id')
  getSingleTransaction(@Param('id') id: string) {
    return this.walletService.getTransaction(id);
  }

  @Roles(Role.Admin)
  @Put('transactions/:id/reverse')
  reverseTransaction(@Param('id') id: string) {
    return this.walletService.reverseTransaction(id);
  }
}
