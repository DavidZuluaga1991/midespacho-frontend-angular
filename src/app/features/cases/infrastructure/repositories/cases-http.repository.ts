import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CasesRepository,
  ListCaseFilesParams,
  ListCaseFilesResult,
  UploadCaseFilesCommand,
  UploadCaseFilesResult,
} from '../../application/ports/cases.repository';
import { CaseModel } from '../../domain/models/case.model';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { CaseResponseDto, ListCaseFilesResponseDto, UploadCaseFilesResponseDto } from '../dto/cases-api.dto';
import { mapCaseDtoToModel, mapCaseFileDtoToModel, mapFileBatchDtoToModel } from '../mappers/cases.mapper';

const joinUrl = (base: string, path: string): string => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

@Injectable()
export class CasesHttpRepository implements CasesRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

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
