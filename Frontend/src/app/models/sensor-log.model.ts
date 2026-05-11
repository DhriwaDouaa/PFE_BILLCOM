export interface SensorLog {
  id?: number;
  customerId?: number;
  sensorType: string;
  value: number;
  unit?: string;
  timestamp?: string;
  status?: string;
}
