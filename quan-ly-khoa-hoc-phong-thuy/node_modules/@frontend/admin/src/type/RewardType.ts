export interface DetailRewardProps {
  id: string;
  code: string;
  name: string;
  type: string;
  pointRedeemed: number;
  brand: { label: string; value: string };
  gasStation: { label: string; value: string };
  redeemedDate: string;
}
