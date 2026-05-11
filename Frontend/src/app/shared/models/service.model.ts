export interface Service {
  serviceId?: number;
  serviceName: string;
  serviceType: string;
  billingModel: string;
  unitPrice: number;
  unit: string;
  status?: string;
}