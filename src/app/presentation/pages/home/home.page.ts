import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CreateCaseUseCase } from '../../../features/cases/application/use-cases/create-case.use-case';
import { DeleteCaseUseCase } from '../../../features/cases/application/use-cases/delete-case.use-case';
import { ListCasesUseCase } from '../../../features/cases/application/use-cases/list-cases.use-case';
import { UpdateCaseUseCase } from '../../../features/cases/application/use-cases/update-case.use-case';
import { CaseModel } from '../../../features/cases/domain/models/case.model';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <section class="md-card relative overflow-hidden p-5 sm:p-6">
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.14),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(244,63,94,0.12),transparent_36%)]"
        ></div>

        <div class="relative space-y-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">MiDespacho</p>
            <h1 class="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Administracion de expedientes</h1>
            <p class="mt-1 text-sm text-slate-600">
              Gestiona expedientes juridicos, actualiza su estado y entra al detalle documental.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <article class="rounded-xl border border-slate-200 bg-white/80 p-3">
              <p class="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p class="mt-1 text-2xl font-semibold text-slate-900">{{ total() }}</p>
            </article>
            <article class="rounded-xl border border-slate-200 bg-white/80 p-3">
              <p class="text-xs uppercase tracking-wide text-slate-500">Abiertos</p>
              <p class="mt-1 text-2xl font-semibold text-emerald-700">{{ openCasesCount() }}</p>
            </article>
            <article class="rounded-xl border border-slate-200 bg-white/80 p-3">
              <p class="text-xs uppercase tracking-wide text-slate-500">En pagina</p>
              <p class="mt-1 text-2xl font-semibold text-slate-900">{{ cases().length }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="crud-expedientes" class="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside class="space-y-4">
          <section class="md-card p-4 sm:p-5">
            <header class="mb-3 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <h2 class="text-lg font-semibold text-slate-900">CRUD de Expedientes</h2>
                  <p class="text-xs text-slate-500">Crear, editar y eliminar expedientes desde este panel.</p>
                </div>
                <span class="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">HABILITADO</span>
              </div>

              <div class="flex flex-wrap gap-2">
                <button type="button" class="md-btn-secondary" (click)="startCreate()">+ Nuevo expediente</button>
                <button type="button" class="md-btn-ghost" (click)="showCrudPanel.set(!showCrudPanel())">
                  {{ showCrudPanel() ? 'Ocultar panel' : 'Mostrar panel' }}
                </button>
              </div>
            </header>

            @if (showCrudPanel()) {
              <div class="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p class="text-sm font-semibold text-slate-900">{{ formTitle() }}</p>
                <p class="text-xs text-slate-500">{{ formSubtitle() }}</p>
                @if (formMode() === 'edit') {
                  <button type="button" class="mt-2 md-btn-ghost" (click)="startCreate()">Cancelar edicion</button>
                }
              </div>
            }

            @if (showCrudPanel()) {
              <form class="space-y-3" (ngSubmit)="submitCase()" #caseForm="ngForm">
              <div>
                <label for="case-code" class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">Codigo</label>
                <input
                  id="case-code"
                  class="md-input"
                  name="code"
                  [ngModel]="formCode()"
                  (ngModelChange)="formCode.set($event)"
                  required
                  maxlength="40"
                  placeholder="EXP-2026-0002"
                />
              </div>

              <div>
                <label for="case-title" class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">Titulo</label>
                <input
                  id="case-title"
                  class="md-input"
                  name="title"
                  [ngModel]="formTitleValue()"
                  (ngModelChange)="formTitleValue.set($event)"
                  required
                  maxlength="150"
                  placeholder="Proceso laboral - Cliente"
                />
              </div>

              <div>
                <label for="case-description" class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">Descripcion</label>
                <textarea
                  id="case-description"
                  class="md-input min-h-24 resize-y"
                  name="description"
                  [ngModel]="formDescription()"
                  (ngModelChange)="formDescription.set($event)"
                  maxlength="5000"
                  placeholder="Resumen breve del expediente."
                ></textarea>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="case-status" class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">Estado</label>
                  <select
                    id="case-status"
                    class="md-input"
                    name="status"
                    [ngModel]="formStatus()"
                    (ngModelChange)="formStatus.set($event)"
                  >
                    @for (status of statusOptions; track status) {
                      <option [value]="status">{{ status }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label for="case-client-id" class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">Client ID</label>
                  <input
                    id="case-client-id"
                    class="md-input"
                    name="clientId"
                    [ngModel]="formClientId()"
                    (ngModelChange)="formClientId.set($event)"
                    required
                    placeholder="UUID del cliente"
                  />
                </div>
              </div>

              <div>
                <label for="case-created-by-id" class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600"
                  >Created by ID (opcional)</label
                >
                <input
                  id="case-created-by-id"
                  class="md-input"
                  name="createdById"
                  [ngModel]="formCreatedById()"
                  (ngModelChange)="formCreatedById.set($event)"
                  placeholder="UUID del usuario"
                />
              </div>

              @if (actionError()) {
                <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {{ actionError() }}
                </p>
              }
              @if (actionSuccess()) {
                <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {{ actionSuccess() }}
                </p>
              }

              <button type="submit" class="md-btn-primary w-full justify-center" [disabled]="actionLoading() || !caseForm.form.valid">
                {{ actionButtonLabel() }}
              </button>
              </form>
            }
          </section>
        </aside>

        <section class="space-y-4">
          <section class="md-card p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-slate-900">Listado de expedientes</h2>
                <p class="text-sm text-slate-600">Busca, edita o elimina expedientes existentes.</p>
              </div>

              <div class="flex w-full gap-2 sm:w-auto">
                <input
                  class="md-input"
                  [ngModel]="searchTerm()"
                  (ngModelChange)="searchTerm.set($event)"
                  name="search"
                  placeholder="Buscar por codigo o titulo"
                />
                <button type="button" class="md-btn-ghost" (click)="applySearch()" [disabled]="loading()">Buscar</button>
              </div>
            </div>
          </section>

          @if (loading()) {
            <section class="md-card p-4 text-slate-600" role="status">Cargando expedientes...</section>
          } @else if (error()) {
            <section class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700" role="alert">
              <p>{{ error() }}</p>
              <button type="button" class="mt-3 md-btn-secondary" (click)="reload()">Reintentar</button>
            </section>
          } @else if (!cases().length) {
            <section class="md-card p-5 text-center">
              <p class="text-sm font-medium text-slate-700">No hay expedientes para mostrar.</p>
              <p class="mt-1 text-xs text-slate-500">Crea un expediente desde el formulario para iniciar.</p>
            </section>
          } @else {
            <section class="grid gap-3">
              @for (item of cases(); track item.id) {
                <article
                  class="md-card p-4 transition hover:-translate-y-0.5"
                  [class.ring-2]="selectedCaseId() === item.id"
                  [class.ring-sky-200]="selectedCaseId() === item.id"
                >
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p class="text-xs font-semibold tracking-wide text-sky-700">{{ item.code }}</p>
                      <h3 class="mt-1 text-base font-semibold text-slate-900">{{ item.title }}</h3>
                    </div>
                    <span class="rounded-full px-3 py-1 text-xs font-semibold" [class]="statusClass(item.status)">
                      {{ item.status }}
                    </span>
                  </div>

                  <p class="mt-2 text-sm text-slate-600">
                    {{ item.description || 'Sin descripcion registrada.' }}
                  </p>

                  <div class="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <p>Apertura: {{ item.openedAt | date: 'mediumDate' }}</p>
                    <p>Client ID: {{ item.clientId }}</p>
                  </div>

                  <div class="mt-4 flex flex-wrap items-center gap-2">
                    <button type="button" class="md-btn-secondary !px-4 !py-1.5 !text-xs" (click)="startEdit(item)">Editar expediente</button>
                    <button
                      type="button"
                      class="md-btn-danger !px-4 !py-1.5"
                      [disabled]="actionLoading()"
                      (click)="deleteCase(item)"
                    >
                      Eliminar expediente
                    </button>
                    <a [routerLink]="['/app/cases', item.id]" class="md-btn-primary !px-4 !py-1.5 !text-xs">Abrir expediente</a>
                  </div>
                </article>
              }
            </section>

            <div class="md-card flex items-center justify-between px-3 py-2 text-sm">
              <span class="text-slate-600">Pagina {{ page() }} - {{ total() }} registros</span>
              <div class="flex gap-2">
                <button type="button" class="md-btn-ghost" [disabled]="page() === 1 || loading()" (click)="goToPage(page() - 1)">
                  Anterior
                </button>
                <button type="button" class="md-btn-ghost" [disabled]="!hasNext() || loading()" (click)="goToPage(page() + 1)">
                  Siguiente
                </button>
              </div>
            </div>
          }
        </section>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly listCasesUseCase = inject(ListCasesUseCase);
  private readonly createCaseUseCase = inject(CreateCaseUseCase);
  private readonly updateCaseUseCase = inject(UpdateCaseUseCase);
  private readonly deleteCaseUseCase = inject(DeleteCaseUseCase);

  protected readonly statusOptions: CaseModel['status'][] = [
    'OPEN',
    'IN_PROGRESS',
    'ON_HOLD',
    'CLOSED',
  ];

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly cases = signal<CaseModel[]>([]);
  protected readonly page = signal(1);
  protected readonly limit = signal(10);
  protected readonly total = signal(0);
  protected readonly hasNext = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly appliedSearch = signal('');

  protected readonly formMode = signal<'create' | 'edit'>('create');
  protected readonly showCrudPanel = signal(true);
  protected readonly selectedCaseId = signal<string | null>(null);
  protected readonly formCode = signal('');
  protected readonly formTitleValue = signal('');
  protected readonly formDescription = signal('');
  protected readonly formStatus = signal<CaseModel['status']>('OPEN');
  protected readonly formClientId = signal('');
  protected readonly formCreatedById = signal('');

  protected readonly actionLoading = signal(false);
  protected readonly actionError = signal<string | null>(null);
  protected readonly actionSuccess = signal<string | null>(null);
  private readonly pendingEditCaseId = signal<string | null>(null);

  protected readonly openCasesCount = computed(
    () => this.cases().filter((item) => item.status === 'OPEN').length,
  );
  protected readonly formTitle = computed(() =>
    this.formMode() === 'create' ? 'Nuevo expediente' : 'Editar expediente',
  );
  protected readonly formSubtitle = computed(() =>
    this.formMode() === 'create'
      ? 'Completa la informacion base del expediente.'
      : 'Actualiza los datos y guarda cambios.',
  );
  protected readonly actionButtonLabel = computed(() => {
    if (this.actionLoading()) {
      return this.formMode() === 'create' ? 'Creando...' : 'Guardando...';
    }

    return this.formMode() === 'create'
      ? 'Crear expediente'
      : 'Guardar cambios';
  });

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pendingEditCaseId.set(params.get('edit'));
        this.applyPendingEditIfAny();
      });

    this.loadCases(1);
  }

  protected reload(): void {
    this.loadCases(this.page());
  }

  protected applySearch(): void {
    this.appliedSearch.set(this.searchTerm().trim());
    this.loadCases(1);
  }

  protected goToPage(page: number): void {
    if (page < 1 || (page !== this.page() && page > this.page() && !this.hasNext())) {
      return;
    }

    this.loadCases(page);
  }

  protected startCreate(): void {
    this.showCrudPanel.set(true);
    this.formMode.set('create');
    this.selectedCaseId.set(null);
    this.formCode.set('');
    this.formTitleValue.set('');
    this.formDescription.set('');
    this.formStatus.set('OPEN');
    this.formCreatedById.set('');
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.prefillClientId();
  }

  protected startEdit(caseItem: CaseModel): void {
    this.showCrudPanel.set(true);
    this.formMode.set('edit');
    this.selectedCaseId.set(caseItem.id);
    this.formCode.set(caseItem.code);
    this.formTitleValue.set(caseItem.title);
    this.formDescription.set(caseItem.description ?? '');
    this.formStatus.set(caseItem.status);
    this.formClientId.set(caseItem.clientId);
    this.formCreatedById.set(caseItem.createdById ?? '');
    this.actionError.set(null);
    this.actionSuccess.set(null);
  }

  protected submitCase(): void {
    const code = this.formCode().trim();
    const title = this.formTitleValue().trim();
    const clientId = this.formClientId().trim();

    if (!code || !title || !clientId) {
      this.actionError.set('Codigo, titulo y client ID son obligatorios.');
      this.actionSuccess.set(null);
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    const description = this.formDescription().trim();
    const createdByIdRaw = this.formCreatedById().trim();
    const createdById = createdByIdRaw ? createdByIdRaw : null;

    if (this.formMode() === 'create') {
      this.createCaseUseCase
        .execute({
          code,
          title,
          description: description || null,
          status: this.formStatus(),
          clientId,
          createdById,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.actionLoading.set(false);
            this.startCreate();
            this.actionSuccess.set('Expediente creado correctamente.');
            this.loadCases(1);
          },
          error: (error: unknown) => {
            this.actionLoading.set(false);
            this.actionError.set(this.mapCrudError(error, 'No fue posible crear el expediente.'));
          },
        });
      return;
    }

    const caseId = this.selectedCaseId();
    if (!caseId) {
      this.actionLoading.set(false);
      this.actionError.set('No hay expediente seleccionado para editar.');
      return;
    }

    this.updateCaseUseCase
      .execute({
        caseId,
        code,
        title,
        description: description || null,
        status: this.formStatus(),
        clientId,
        createdById,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionLoading.set(false);
          this.actionSuccess.set('Expediente actualizado correctamente.');
          this.loadCases(this.page());
        },
        error: (error: unknown) => {
          this.actionLoading.set(false);
          this.actionError.set(this.mapCrudError(error, 'No fue posible actualizar el expediente.'));
        },
      });
  }

  protected deleteCase(caseItem: CaseModel): void {
    if (this.actionLoading()) {
      return;
    }

    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Se eliminara el expediente "${caseItem.code}". Deseas continuar?`)
    ) {
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.deleteCaseUseCase
      .execute(caseItem.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionLoading.set(false);
          if (this.selectedCaseId() === caseItem.id) {
            this.startCreate();
          }
          this.actionSuccess.set('Expediente eliminado correctamente.');
          const targetPage = this.cases().length === 1 && this.page() > 1 ? this.page() - 1 : this.page();
          this.loadCases(targetPage);
        },
        error: (error: unknown) => {
          this.actionLoading.set(false);
          this.actionError.set(this.mapCrudError(error, 'No fue posible eliminar el expediente.'));
        },
      });
  }

  protected statusClass(status: CaseModel['status']): string {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-100 text-emerald-800';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800';
      case 'ON_HOLD':
        return 'bg-slate-200 text-slate-700';
      case 'CLOSED':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  }

  private loadCases(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.listCasesUseCase
      .execute({
        page,
        limit: this.limit(),
        search: this.appliedSearch() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.cases.set(result.data);
          this.page.set(result.meta.page);
          this.limit.set(result.meta.limit);
          this.total.set(result.meta.total);
          this.hasNext.set(result.meta.hasNext);
          this.loading.set(false);
          this.prefillClientId();
          this.applyPendingEditIfAny();
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.error.set(this.mapListError(error));
        },
      });
  }

  private prefillClientId(): void {
    if (this.formMode() !== 'create') {
      return;
    }

    if (this.formClientId().trim()) {
      return;
    }

    const firstCase = this.cases()[0];
    if (firstCase) {
      this.formClientId.set(firstCase.clientId);
    }
  }

  private applyPendingEditIfAny(): void {
    const editCaseId = this.pendingEditCaseId();
    if (!editCaseId || !this.cases().length) {
      return;
    }

    const target = this.cases().find((item) => item.id === editCaseId);
    if (!target) {
      return;
    }

    this.startEdit(target);
    this.pendingEditCaseId.set(null);
  }

  private mapListError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No fue posible cargar los expedientes.';
    }

    if (error.status === 0) {
      return 'No hay conexion con el backend.';
    }

    return 'Error consultando expedientes. Verifica backend y base de datos.';
  }

  private mapCrudError(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    if (error.status === 0) {
      return 'No hay conexion con el backend.';
    }

    if (error.status === 409) {
      return 'El codigo del expediente ya existe.';
    }

    if (error.status === 404) {
      return 'No se encontro el recurso relacionado.';
    }

    if (error.status === 422) {
      return this.extractPayloadMessage(error.error) ?? 'Hay errores de validacion en los datos.';
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
