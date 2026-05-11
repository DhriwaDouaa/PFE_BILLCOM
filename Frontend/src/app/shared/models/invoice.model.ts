export interface Invoice {
  invoiceId?: number;
  custId: number;
  periodStart: string;
  periodEnd: string;
  rawAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  createdDate?: string;
}