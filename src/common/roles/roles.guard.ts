import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums';
import { ROLES_KEY } from './roles.decorator';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const { id } = context.switchToHttp().getRequest();
    const user = await this.authService.getAuthUser(id as string);

    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role.includes(role));
  }
}
