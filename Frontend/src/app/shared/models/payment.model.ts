export interface Payment {
  paymentId?: number;
  invoiceId: number;
  custId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}