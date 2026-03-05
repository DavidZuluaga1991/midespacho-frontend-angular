import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CasesRepository, UpdateCaseCommand } from '../ports/cases.repository';
import { CaseModel } from '../../domain/models/case.model';

@Injectable({ providedIn: 'root' })
export class UpdateCaseUseCase {
  private readonly repository = inject(CasesRepository);

  execute(command: UpdateCaseCommand): Observable<CaseModel> {
    return this.repository.updateCase(command);
  }
}
