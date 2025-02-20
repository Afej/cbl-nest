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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.User)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: 'Get user wallet balance' })
  @ApiOkResponse({ description: 'Wallet retrieved successfully' })
  @Get()
  getUserWallet(@Request() req: AuthGuardRequest) {
    const userId = req.user._id.toString();
    return this.walletService.getUserWallet(userId);
  }

  @ApiOperation({ summary: 'Deposit funds to wallet' })
  @ApiOkResponse({
    description: 'Deposit successful',
    type: DepositDto,
  })
  @Post('deposit')
  deposit(@Request() req: AuthGuardRequest, @Body() depositDto: DepositDto) {
    const userId = req.user._id.toString();
    return this.walletService.deposit(userId, depositDto);
  }

  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiOkResponse({
    description: 'Withdrawal successful',
    type: WithdrawDto,
  })
  @Post('withdraw')
  withdraw(@Request() req: AuthGuardRequest, @Body() withdrawDto: WithdrawDto) {
    const userId = req.user._id.toString();
    return this.walletService.withdraw(userId, withdrawDto);
  }

  @ApiOperation({ summary: 'Transfer funds to another user' })
  @ApiOkResponse({
    description: 'Transfer successful',
    type: TransferDto,
  })
  @Post('transfer')
  transfer(@Request() req: AuthGuardRequest, @Body() transferDto: TransferDto) {
    const userId = req.user._id.toString();
    return this.walletService.transfer(userId, transferDto);
  }

  @ApiOperation({ summary: 'Get user transaction history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Transactions retrieved successfully' })
  @Get('transactions')
  getUserTransactions(
    @Request() req: AuthGuardRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
  ) {
    const userId = req.user._id.toString();
    return this.walletService.getUserTransactions(userId, page, limit);
  }

  @ApiOperation({ summary: 'Get all transactions (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'All transactions retrieved successfully' })
  @Roles(Role.Admin)
  @Get('transactions/all')
  getAllTransactions(
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
  ) {
    return this.walletService.getAllTransactions(page, limit);
  }

  @ApiOperation({ summary: 'Get single transaction details (Admin only)' })
  @ApiOkResponse({ description: 'Transaction retrieved successfully' })
  @Roles(Role.Admin)
  @Get('transactions/:id')
  getSingleTransaction(@Param('id') id: string) {
    return this.walletService.getTransaction(id);
  }

  @ApiOperation({ summary: 'Reverse a transaction (Admin only)' })
  @ApiOkResponse({ description: 'Transaction reversed successfully' })
  @Roles(Role.Admin)
  @Put('transactions/:id/reverse')
  reverseTransaction(@Param('id') id: string) {
    return this.walletService.reverseTransaction(id);
  }
}
