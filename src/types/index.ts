export interface ProcessingFees {
  merchant: {
    rate: number;
    fixed: string;
  };
  patient: {
    rate: number;
    fixed: string;
  };
}

export interface Organization {
  id: number;
  name: string;
  totalProcessingFeeFixed: number;
  totalProcessingFeePercentage: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Location {
  id: number;
  name: string;
  taxRate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Reader {
  id: number;
  label: string;
  readerId: string;
  status: string;
  locationId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface LocationOption extends Location {
  label: string;
  value: number;
}

export interface ReaderOption extends Reader {
  value: number;
}
