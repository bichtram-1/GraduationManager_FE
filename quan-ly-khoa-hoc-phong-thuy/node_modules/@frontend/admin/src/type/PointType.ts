export interface PointHistoryType {
  id: string;
  code: string;
  activity: string;
  point: number;
  paymentDescription: string;
  paymentMethod: string;
  brand: { label: string; value: string };
  gasStation: { label: string; value: string };
  time: string;
}
