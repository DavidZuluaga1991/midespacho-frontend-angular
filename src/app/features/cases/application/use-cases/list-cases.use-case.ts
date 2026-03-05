import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CasesRepository, ListCasesParams, ListCasesResult } from '../ports/cases.repository';

@Injectable({ providedIn: 'root' })
export class ListCasesUseCase {
  private readonly repository = inject(CasesRepository);

  execute(params: ListCasesParams): Observable<ListCasesResult> {
    return this.repository.listCases(params);
  }
}

