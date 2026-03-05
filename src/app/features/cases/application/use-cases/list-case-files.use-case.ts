import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CasesRepository, ListCaseFilesParams, ListCaseFilesResult } from '../ports/cases.repository';

@Injectable({ providedIn: 'root' })
export class ListCaseFilesUseCase {
  constructor(private readonly casesRepository: CasesRepository) {}

  execute(params: ListCaseFilesParams): Observable<ListCaseFilesResult> {
    return this.casesRepository.listCaseFiles(params);
  }
}

