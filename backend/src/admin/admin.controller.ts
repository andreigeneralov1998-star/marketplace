import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id/approve-seller')
  approveSeller(@Param('id') id: string) {
    return this.adminService.approveSeller(id);
  }

  @Patch('users/:id/revoke-seller')
  revokeSeller(@Param('id') id: string) {
    return this.adminService.revokeSeller(id);
  }
}