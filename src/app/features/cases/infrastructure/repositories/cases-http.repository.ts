import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CasesRepository,
  CreateCaseCommand,
  ListCasesParams,
  ListCasesResult,
  ListCaseFilesParams,
  ListCaseFilesResult,
  UpdateCaseCommand,
  UploadCaseFilesCommand,
  UploadCaseFilesResult,
} from '../../application/ports/cases.repository';
import { CaseModel } from '../../domain/models/case.model';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import {
  CaseResponseDto,
  CreateCaseRequestDto,
  ListCaseFilesResponseDto,
  ListCasesResponseDto,
  UpdateCaseRequestDto,
  UploadCaseFilesResponseDto,
} from '../dto/cases-api.dto';
import { mapCaseDtoToModel, mapCaseFileDtoToModel, mapFileBatchDtoToModel } from '../mappers/cases.mapper';

const joinUrl = (base: string, path: string): string => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

@Injectable()
export class CasesHttpRepository implements CasesRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listCases(params: ListCasesParams): Observable<ListCasesResult> {
    let httpParams = new HttpParams();
    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http
      .get<ListCasesResponseDto>(joinUrl(this.apiBaseUrl, 'cases'), { params: httpParams })
      .pipe(
        map((response) => ({
          data: response.data.map(mapCaseDtoToModel),
          meta: response.meta,
        })),
      );
  }

  createCase(command: CreateCaseCommand): Observable<CaseModel> {
    const payload: CreateCaseRequestDto = {
      code: command.code,
      title: command.title,
      description: command.description ?? null,
      status: command.status,
      openedAt: command.openedAt?.toISOString(),
      closedAt:
        command.closedAt === undefined
          ? undefined
          : command.closedAt === null
            ? null
            : command.closedAt.toISOString(),
      clientId: command.clientId,
      createdById:
        command.createdById === undefined ? undefined : command.createdById,
    };

    return this.http
      .post<CaseResponseDto>(joinUrl(this.apiBaseUrl, 'cases'), payload)
      .pipe(map((dto) => mapCaseDtoToModel(dto)));
  }

  updateCase(command: UpdateCaseCommand): Observable<CaseModel> {
    const payload: UpdateCaseRequestDto = {
      code: command.code,
      title: command.title,
      description: command.description,
      status: command.status,
      openedAt: command.openedAt?.toISOString(),
      closedAt:
        command.closedAt === undefined
          ? undefined
          : command.closedAt === null
            ? null
            : command.closedAt.toISOString(),
      clientId: command.clientId,
      createdById:
        command.createdById === undefined ? undefined : command.createdById,
    };

    return this.http
      .patch<CaseResponseDto>(
        joinUrl(this.apiBaseUrl, `cases/${command.caseId}`),
        payload,
      )
      .pipe(map((dto) => mapCaseDtoToModel(dto)));
  }

  deleteCase(caseId: string): Observable<void> {
    return this.http.delete<void>(joinUrl(this.apiBaseUrl, `cases/${caseId}`));
  }

  getCaseById(caseId: string): Observable<CaseModel> {
    return this.http
      .get<CaseResponseDto>(joinUrl(this.apiBaseUrl, `cases/${caseId}`))
      .pipe(map((dto) => mapCaseDtoToModel(dto)));
  }

  listCaseFiles(params: ListCaseFilesParams): Observable<ListCaseFilesResult> {
    let httpParams = new HttpParams();
    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }
    if (params.batchId) {
      httpParams = httpParams.set('batchId', params.batchId);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http
      .get<ListCaseFilesResponseDto>(joinUrl(this.apiBaseUrl, `cases/${params.caseId}/files`), {
        params: httpParams,
      })
      .pipe(
        map((response) => ({
          data: response.data.map(mapCaseFileDtoToModel),
          meta: response.meta,
        })),
      );
  }

  uploadCaseFiles(command: UploadCaseFilesCommand): Observable<UploadCaseFilesResult> {
    const formData = new FormData();
    formData.set('batchTitle', command.batchTitle);
    formData.set('batchDescription', command.batchDescription);
    command.files.forEach((file) => formData.append('files', file));

    return this.http
      .post<UploadCaseFilesResponseDto>(joinUrl(this.apiBaseUrl, `cases/${command.caseId}/files`), formData)
      .pipe(
        map((response) => ({
          batch: mapFileBatchDtoToModel(response.batch),
          files: response.files.map(mapCaseFileDtoToModel),
        })),
      );
  }
}
