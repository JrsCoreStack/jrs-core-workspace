import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/utils/enums/permission.enum';

export const RequirePermission = (permission: Permission) =>
  SetMetadata('permission', permission);
