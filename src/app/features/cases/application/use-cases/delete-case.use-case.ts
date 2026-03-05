import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CasesRepository } from '../ports/cases.repository';

@Injectable({ providedIn: 'root' })
export class DeleteCaseUseCase {
  private readonly repository = inject(CasesRepository);

  execute(caseId: string): Observable<void> {
    return this.repository.deleteCase(caseId);
  }
}
