import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CaseModel } from '../../../domain/models/case.model';
import { LoadCaseDetailUseCase } from '../../../application/use-cases/load-case-detail.use-case';
import { CaseFileModel } from '../../../domain/models/case-file.model';
import { ListCaseFilesUseCase } from '../../../application/use-cases/list-case-files.use-case';
import { UploadCaseFilesUseCase } from '../../../application/use-cases/upload-case-files.use-case';
import { CaseHeaderComponent } from '../../components/case-header/case-header.component';
import { UploadBatchFormComponent, UploadBatchFormSubmitEvent } from '../../components/upload-batch-form/upload-batch-form.component';
import { FilesListComponent } from '../../components/files-list/files-list.component';

@Component({
  selector: 'app-case-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CaseHeaderComponent, UploadBatchFormComponent, FilesListComponent],
  templateUrl: './case-detail.page.html',
  styleUrl: './case-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadCaseDetailUseCase = inject(LoadCaseDetailUseCase);
  private readonly listCaseFilesUseCase = inject(ListCaseFilesUseCase);
  private readonly uploadCaseFilesUseCase = inject(UploadCaseFilesUseCase);

  protected readonly caseLoading = signal<boolean>(true);
  protected readonly caseError = signal<string | null>(null);
  protected readonly caseDetail = signal<CaseModel | null>(null);
  protected readonly filesLoading = signal<boolean>(true);
  protected readonly filesError = signal<string | null>(null);
  protected readonly files = signal<CaseFileModel[]>([]);
  protected readonly uploading = signal<boolean>(false);
  protected readonly uploadSuccessMessage = signal<string | null>(null);
  protected readonly uploadErrorMessage = signal<string | null>(null);
  protected readonly uploadFormResetKey = signal<number>(0);
  private readonly currentCaseId = signal<string | null>(null);

  protected readonly totalBatches = computed(() => new Set(this.files().map((file) => file.batchId)).size);
  protected readonly lastUpdate = computed(() => this.files()[0]?.createdAt ?? this.caseDetail()?.updatedAt ?? null);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (params) => {
          const caseId = params.get('id');
          if (!caseId) {
            this.caseError.set('No se encontro el identificador del expediente.');
            this.caseLoading.set(false);
            this.filesLoading.set(false);
            return;
          }

          this.currentCaseId.set(caseId);
          this.uploadSuccessMessage.set(null);
          this.uploadErrorMessage.set(null);
          this.loadCase(caseId);
          this.loadFiles(caseId);
        },
      });
  }

  protected onSubmitBatch(event: UploadBatchFormSubmitEvent): void {
    const caseId = this.currentCaseId();
    if (!caseId || this.uploading()) {
      return;
    }

    this.uploading.set(true);
    this.uploadErrorMessage.set(null);
    this.uploadSuccessMessage.set(null);

    this.uploadCaseFilesUseCase
      .execute({
        caseId,
        batchTitle: event.batchTitle,
        batchDescription: event.batchDescription,
        files: event.files,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.uploading.set(false);
          this.uploadSuccessMessage.set(`${result.files.length} archivo(s) cargado(s) correctamente.`);
          this.uploadFormResetKey.update((value) => value + 1);
          this.loadFiles(caseId);
        },
        error: () => {
          this.uploading.set(false);
          this.uploadErrorMessage.set('No fue posible subir el lote. Verifica los datos e intenta nuevamente.');
        },
      });
  }

  private loadCase(caseId: string): void {
    this.caseLoading.set(true);
    this.caseError.set(null);
    this.loadCaseDetailUseCase
      .execute(caseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (caseDetail) => {
          this.caseDetail.set(caseDetail);
          this.caseLoading.set(false);
        },
        error: () => {
          this.caseError.set('No fue posible cargar el expediente.');
          this.caseLoading.set(false);
        },
      });
  }

  private loadFiles(caseId: string): void {
    this.filesLoading.set(true);
    this.filesError.set(null);
    this.listCaseFilesUseCase
      .execute({
        caseId,
        page: 1,
        limit: 50,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.files.set(result.data);
          this.filesLoading.set(false);
        },
        error: () => {
          this.filesError.set('No fue posible obtener el listado de archivos.');
          this.filesLoading.set(false);
        },
      });
  }
}
