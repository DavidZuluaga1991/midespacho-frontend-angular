import { Observable } from 'rxjs';
import { CaseModel } from '../../domain/models/case.model';
import { CaseFileModel } from '../../domain/models/case-file.model';
import { FileBatchModel } from '../../domain/models/file-batch.model';

export interface ListCaseFilesParams {
  caseId: string;
  page?: number;
  limit?: number;
  batchId?: string;
  search?: string;
}

export interface ListCasesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListCasesResult {
  data: CaseModel[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export interface CreateCaseCommand {
  code: string;
  title: string;
  description?: string | null;
  status?: CaseModel['status'];
  openedAt?: Date;
  closedAt?: Date | null;
  clientId: string;
  createdById?: string | null;
}

export interface UpdateCaseCommand {
  caseId: string;
  code?: string;
  title?: string;
  description?: string | null;
  status?: CaseModel['status'];
  openedAt?: Date;
  closedAt?: Date | null;
  clientId?: string;
  createdById?: string | null;
}

export interface ListCaseFilesResult {
  data: CaseFileModel[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export interface UploadCaseFilesCommand {
  caseId: string;
  batchTitle: string;
  batchDescription: string;
  files: File[];
}

export interface UploadCaseFilesResult {
  batch: FileBatchModel;
  files: CaseFileModel[];
}

export abstract class CasesRepository {
  abstract listCases(params: ListCasesParams): Observable<ListCasesResult>;
  abstract createCase(command: CreateCaseCommand): Observable<CaseModel>;
  abstract updateCase(command: UpdateCaseCommand): Observable<CaseModel>;
  abstract deleteCase(caseId: string): Observable<void>;
  abstract getCaseById(caseId: string): Observable<CaseModel>;
  abstract listCaseFiles(params: ListCaseFilesParams): Observable<ListCaseFilesResult>;
  abstract uploadCaseFiles(command: UploadCaseFilesCommand): Observable<UploadCaseFilesResult>;
}
