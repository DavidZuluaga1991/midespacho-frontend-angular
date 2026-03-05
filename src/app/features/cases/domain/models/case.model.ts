export interface CaseModel {
  id: string;
  code: string;
  title: string;
  description: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'CLOSED';
  openedAt: Date;
  closedAt: Date | null;
  clientId: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

