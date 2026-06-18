// src/components/auth/RoleGuard.tsx
"use client";
import type { ReactNode } from "react";
import { RoleLevel } from "../../constants/commonConst";
import { useGlobalVariable } from "../../hooks/GlobalVariableProvider";

/** 3 cấp quyền: GAS_STATION_OWNER < BRAND_OWNER < ADMIN (ADMIN nhìn thấy tất cả) */

type RoleGuardProps = {
  /** Yêu cầu tối thiểu: GAS_STATION_OWNER | BRAND_OWNER | ADMIN */
  roles: ReturnType<typeof RoleLevel>[number]["value"][];
  /** Nội dung cần bảo vệ */
  children: ReactNode;
  /** Hiển thị khi chưa đủ quyền (mặc định: ẩn) */
  fallback?: ReactNode;
};

/** Component đơn nhiệm: kiểm tra level, render children hoặc fallback */
export function RoleGuard({
  roles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useGlobalVariable()
  const level = user?.role

  if(!level || !roles.includes(level)) return <>{fallback}</>

  return <>{children}</>
}
