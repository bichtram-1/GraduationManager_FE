import { ParentNode } from '@shared/components/select/TreeSelect';

export interface DetailCustomerProps {
  id: string;
  code: string;
  name: string;
  grade: string;
  birthday: string;
  weddingAnni: string;
  address: string;
  phone: string;
  car: string;
  numberOfRefueling: number;
  lastRefuel: string;
  email: string;
  point: number;
  createdAt: string;
  updatedAt: string;
  brand: ParentNode[]
  totalSpent: string;
  pointsExpired: string;
  currentPoints: string
  pointsRedeemed: number;
  pointsAccumulated: number;
}

export interface PointHistoryItem {
  custommerId: string;
  fieldType: 'point' | 'pointAccumulated' | 'pointRedeemed';
  action: 'add' | 'subtract';
  reason: string;
  oldValue: number;
  newValue: number;
}

export interface PointUpdateData {
  id: string;
  fieldType: 'point' | 'pointAccumulated' | 'pointRedeemed';
  action: 'add' | 'subtract';
  newValue: number;
  reason: string;
}
export interface PointUsageHistoryType {
  id: number;
  activity: 'Accumulate point' | 'Redeem point';
  point: number;
  payment: string;
  gasStation: string;
  time: string;
}

export interface CreateCustomerVariables<T, P> {
  body: T;
  params: P;
}

export interface UpdateCustomerVariables<T, P> {
  id: string;
  body: T;
  index: number;
  params: P;
}

export interface DeleteCustomerVariables<P> {
  id: string;
  params: P;
}
