export interface CaseResponseDto {
  id: string;
  code: string;
  title: string;
  description: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'CLOSED';
  openedAt: string;
  closedAt: string | null;
  clientId: string;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListCasesResponseDto {
  data: CaseResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export interface CaseFileResponseDto {
  id: string;
  caseId: string;
  batchId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: string;
  storageProvider: string;
  storageKey: string;
  publicUrl: string;
  uploadedById: string | null;
  createdAt: string;
}

export interface FileBatchResponseDto {
  id: string;
  caseId: string;
  title: string;
  description: string;
  uploadedById: string | null;
  createdAt: string;
}

export interface ListCaseFilesResponseDto {
  data: CaseFileResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export interface UploadCaseFilesResponseDto {
  batch: FileBatchResponseDto;
  files: CaseFileResponseDto[];
}
