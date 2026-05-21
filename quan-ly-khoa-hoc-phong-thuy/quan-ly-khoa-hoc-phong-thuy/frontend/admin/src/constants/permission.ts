import { RoleAdmin, RoleBrandOwner, RoleGasStationOwner } from "./commonConst";

// Define permissions for each role
interface RolePermissionMap {
    canViewTierConfiguration: boolean;
    canEditTierConfiguration: boolean;
    canEditPointConfiguration: boolean;
    canSeeAccountManagement: boolean; 
    canSeeBrandManagement: boolean; 
    canCreateCouponRules: boolean;
    canEditCouponRules: boolean;
    canDeleteCouponRules: boolean;
}

export const PERMISSION: Record<string, RolePermissionMap> = {
    [RoleAdmin().value]: {
        canViewTierConfiguration: true,
        canEditTierConfiguration: true,
        canEditPointConfiguration: true,
        canSeeAccountManagement: true,
        canSeeBrandManagement: true,
        canCreateCouponRules: true,
        canEditCouponRules: true,
        canDeleteCouponRules: true,
    },
    [RoleBrandOwner().value]: {
        canViewTierConfiguration: true,
        canEditTierConfiguration: false,
        canEditPointConfiguration: true,
        canSeeAccountManagement: true,
        canSeeBrandManagement: true,
        canCreateCouponRules: true,
        canEditCouponRules: true,
        canDeleteCouponRules: true,
    },
    [RoleGasStationOwner().value]: {
        canViewTierConfiguration: true,
        canEditTierConfiguration: false,
        canEditPointConfiguration: false,
        canSeeAccountManagement: false,
        canSeeBrandManagement: false,
        canCreateCouponRules: false,
        canEditCouponRules: false,
        canDeleteCouponRules: false,
    },
}