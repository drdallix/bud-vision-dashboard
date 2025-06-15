
export interface PricePoint {
  id: string;
  strainId: string;
  nowPrice: number;
  wasPrice?: number | null;
  createdAt: string;
}
