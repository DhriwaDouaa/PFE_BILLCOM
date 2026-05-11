export interface Member {
  custId?: number;
  name: string;
  email?: string;
  phone?: string;
  balance?: number;
  status?: string;
  clientType?: string;
  verificationStatus?: string;
  verificationDoc?: string;
  profilePicture?: string;
}

export interface Vehicle {
  id?: number;
  memberId?: number;
  brand: string;
  model: string;
  licensePlate: string;
  year?: number;
}
