import { CaseModel } from '../../domain/models/case.model';
import { CaseFileModel } from '../../domain/models/case-file.model';
import { FileBatchModel } from '../../domain/models/file-batch.model';
import { CaseFileResponseDto, CaseResponseDto, FileBatchResponseDto } from '../dto/cases-api.dto';

export const mapCaseDtoToModel = (dto: CaseResponseDto): CaseModel => ({
  id: dto.id,
  code: dto.code,
  title: dto.title,
  description: dto.description,
  status: dto.status,
  openedAt: new Date(dto.openedAt),
  closedAt: dto.closedAt ? new Date(dto.closedAt) : null,
  clientId: dto.clientId,
  createdById: dto.createdById,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});

export const mapCaseFileDtoToModel = (dto: CaseFileResponseDto): CaseFileModel => ({
  id: dto.id,
  caseId: dto.caseId,
  batchId: dto.batchId,
  originalName: dto.originalName,
  storedName: dto.storedName,
  mimeType: dto.mimeType,
  sizeBytes: dto.sizeBytes,
  storageProvider: dto.storageProvider,
  storageKey: dto.storageKey,
  publicUrl: dto.publicUrl,
  uploadedById: dto.uploadedById,
  createdAt: new Date(dto.createdAt),
});

export const mapFileBatchDtoToModel = (dto: FileBatchResponseDto): FileBatchModel => ({
  id: dto.id,
  caseId: dto.caseId,
  title: dto.title,
  description: dto.description,
  uploadedById: dto.uploadedById,
  createdAt: new Date(dto.createdAt),
});

