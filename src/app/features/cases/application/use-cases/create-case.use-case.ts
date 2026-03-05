import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CasesRepository, CreateCaseCommand } from '../ports/cases.repository';
import { CaseModel } from '../../domain/models/case.model';

@Injectable({ providedIn: 'root' })
export class CreateCaseUseCase {
  private readonly repository = inject(CasesRepository);

  execute(command: CreateCaseCommand): Observable<CaseModel> {
    return this.repository.createCase(command);
  }
}
