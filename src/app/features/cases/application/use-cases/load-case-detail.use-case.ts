import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CaseModel } from '../../domain/models/case.model';
import { CasesRepository } from '../ports/cases.repository';

@Injectable({ providedIn: 'root' })
export class LoadCaseDetailUseCase {
  constructor(private readonly casesRepository: CasesRepository) {}

  execute(caseId: string): Observable<CaseModel> {
    return this.casesRepository.getCaseById(caseId);
  }
}

