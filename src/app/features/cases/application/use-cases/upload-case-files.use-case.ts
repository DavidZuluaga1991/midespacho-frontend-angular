import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CasesRepository, UploadCaseFilesCommand, UploadCaseFilesResult } from '../ports/cases.repository';

@Injectable({ providedIn: 'root' })
export class UploadCaseFilesUseCase {
  constructor(private readonly casesRepository: CasesRepository) {}

  execute(command: UploadCaseFilesCommand): Observable<UploadCaseFilesResult> {
    return this.casesRepository.uploadCaseFiles(command);
  }
}

