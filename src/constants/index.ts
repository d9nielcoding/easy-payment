import type { Location, Reader, ProcessingFees, Organization } from 'src/types';

// NOTE: fallback values
export const DEFAULT_TAX_RATE = 0.045;

export const DEFAULT_PROCESSING_FEE: ProcessingFees = {
  merchant: {
    rate: 1,
    fixed: '0.05',
  },
  patient: {
    rate: 2.5,
    fixed: '0.05',
  },
} as const;

export const ORGANIZATION: Organization = {
  id: 4,
  name: 'Nitra Clinic',
  totalProcessingFeeFixed: 10,
  totalProcessingFeePercentage: '0.03500',
  createdAt: '2024-01-01T12:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
  deletedAt: null,
} as const;

export const LOCATIONS: Location[] = [
  {
    id: 48,
    name: 'New York Clinic',
    taxRate: '0.04500',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 75,
    name: 'Los Angeles Clinic',
    taxRate: '0.04500',
    createdAt: '2024-03-08T12:00:00Z',
    updatedAt: '2024-03-08T12:00:00Z',
    deletedAt: null,
  },
] as const;

export const READERS: Reader[] = [
  {
    id: 23,
    label: 'Device Reader 01',
    readerId: 'tmr_00000001582624',
    status: 'online',
    locationId: 48,
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 27,
    label: 'Device Reader 02',
    readerId: 'tmr_00000001582658',
    status: 'offline',
    locationId: 48,
    createdAt: '2024-02-13T12:00:00Z',
    updatedAt: '2024-02-13T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 35,
    label: 'Device Reader 03',
    readerId: 'tmr_00000001582824',
    status: 'online',
    locationId: 48,
    createdAt: '2024-02-21T12:00:00Z',
    updatedAt: '2024-02-21T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 58,
    label: 'Device Reader 01',
    readerId: 'tmr_00000001604824',
    status: 'online',
    locationId: 75,
    createdAt: '2024-03-13T12:00:00Z',
    updatedAt: '2024-03-13T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 63,
    label: 'Device Reader 04',
    readerId: 'tmr_00000001604858',
    status: 'online',
    locationId: 48,
    createdAt: '2024-03-18T12:00:00Z',
    updatedAt: '2024-03-18T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 71,
    label: 'Device Reader 02',
    readerId: 'tmr_00000001630824',
    status: 'online',
    locationId: 75,
    createdAt: '2024-03-25T12:00:00Z',
    updatedAt: '2024-03-25T12:00:00Z',
    deletedAt: null,
  },
] as const;
