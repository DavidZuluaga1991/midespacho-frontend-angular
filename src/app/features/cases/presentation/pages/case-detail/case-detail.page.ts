import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CaseModel } from '../../../domain/models/case.model';
import { LoadCaseDetailUseCase } from '../../../application/use-cases/load-case-detail.use-case';

@Component({
  selector: 'app-case-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './case-detail.page.html',
  styleUrl: './case-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadCaseDetailUseCase = inject(LoadCaseDetailUseCase);

  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly caseDetail = signal<CaseModel | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const caseId = params.get('id');
          if (!caseId) {
            throw new Error('Case id is required in route.');
          }
          this.loading.set(true);
          this.error.set(null);
          return this.loadCaseDetailUseCase.execute(caseId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (caseDetail) => {
          this.caseDetail.set(caseDetail);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No fue posible cargar el expediente.');
          this.loading.set(false);
        },
      });
  }
}

