// staffRole.config.ts

import { RoleAdmin, RoleBrandOwner, RoleGasStationOwner, RoleLevel } from './commonConst';

export const STAFF_ROLE_CONFIG: Record<ReturnType<typeof RoleLevel>[number]["value"], {
  roleValue: ReturnType<typeof RoleLevel>[number]["value"];
  allowedRoles: ReturnType<typeof RoleLevel>[number]["value"][]; // Các role được phép truy cập
   // Title cột ID
}> = {
  [RoleAdmin().value]: {
    roleValue: RoleAdmin().value,
    allowedRoles: [RoleAdmin().value],
    
  },
  [RoleBrandOwner().value]: {
    roleValue: RoleBrandOwner().value,
    allowedRoles: [RoleAdmin().value],
    
  },
  [RoleGasStationOwner().value]: {
    roleValue: RoleGasStationOwner().value,
    allowedRoles: [RoleAdmin().value, RoleBrandOwner().value],
   
  },
};
