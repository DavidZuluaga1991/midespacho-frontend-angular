import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CaseModel } from '../../../domain/models/case.model';
import { LoadCaseDetailUseCase } from '../../../application/use-cases/load-case-detail.use-case';
import { CaseFileModel } from '../../../domain/models/case-file.model';
import { ListCaseFilesUseCase } from '../../../application/use-cases/list-case-files.use-case';
import { UploadCaseFilesUseCase } from '../../../application/use-cases/upload-case-files.use-case';
import { ListCaseFilesResult } from '../../../application/ports/cases.repository';
import { CaseHeaderComponent } from '../../components/case-header/case-header.component';
import { UploadBatchFormComponent, UploadBatchFormSubmitEvent } from '../../components/upload-batch-form/upload-batch-form.component';
import { FilesListComponent } from '../../components/files-list/files-list.component';

@Component({
  selector: 'app-case-detail-page',
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
  protected readonly filesMeta = signal<ListCaseFilesResult['meta']>({
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
  });
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
          this.filesMeta.set({
            page: 1,
            limit: this.filesMeta().limit,
            total: 0,
            hasNext: false,
          });
          this.loadCase(caseId);
          this.loadFiles(caseId, 1);
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
          this.loadFiles(caseId, 1);
        },
        error: (error: unknown) => {
          this.uploading.set(false);
          this.uploadErrorMessage.set(this.resolveHttpErrorMessage(error, 'No fue posible subir el lote.'));
        },
      });
  }

  protected onFilesPageChange(page: number): void {
    const caseId = this.currentCaseId();
    if (!caseId) {
      return;
    }

    this.loadFiles(caseId, page);
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
        error: (error: unknown) => {
          this.caseError.set(this.resolveHttpErrorMessage(error, 'No fue posible cargar el expediente.'));
          this.caseLoading.set(false);
        },
      });
  }

  private loadFiles(caseId: string, page: number): void {
    this.filesLoading.set(true);
    this.filesError.set(null);
    this.listCaseFilesUseCase
      .execute({
        caseId,
        page,
        limit: this.filesMeta().limit,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.files.set(result.data);
          this.filesMeta.set(result.meta);
          this.filesLoading.set(false);
        },
        error: (error: unknown) => {
          this.filesError.set(this.resolveHttpErrorMessage(error, 'No fue posible obtener el listado de archivos.'));
          this.filesLoading.set(false);
        },
      });
  }

  private resolveHttpErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    if (error.status === 0) {
      return 'No hay conexion con el servidor.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'No tienes permisos para realizar esta accion.';
    }

    if (error.status === 422) {
      const payloadMessage = this.extractPayloadMessage(error.error);
      return payloadMessage ?? 'Los datos enviados no cumplen las validaciones.';
    }

    if (error.status >= 500) {
      return 'El servidor presento un error interno. Intenta nuevamente.';
    }

    return this.extractPayloadMessage(error.error) ?? fallback;
  }

  private extractPayloadMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.filter((item): item is string => typeof item === 'string').join('. ');
    }
    if (typeof message === 'string') {
      return message;
    }

    return null;
  }
}
