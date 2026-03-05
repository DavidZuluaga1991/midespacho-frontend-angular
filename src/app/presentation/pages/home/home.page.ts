import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CaseModel } from '../../../features/cases/domain/models/case.model';
import { ListCasesUseCase } from '../../../features/cases/application/use-cases/list-cases.use-case';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 class="text-2xl font-semibold text-slate-900">Expedientes</h1>
      <p class="mt-2 text-slate-600">Selecciona un expediente para ver su detalle y gestionar archivos.</p>

      @if (loading()) {
        <section class="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-slate-600" role="status">
          Cargando expedientes...
        </section>
      } @else if (error()) {
        <section class="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700" role="alert">
          <p>{{ error() }}</p>
          <button type="button" class="mt-3 md-btn-secondary" (click)="reload()">Reintentar</button>
        </section>
      } @else if (!cases().length) {
        <section class="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-slate-600">
          No hay expedientes disponibles.
        </section>
      } @else {
        <section class="mt-5 grid gap-3 sm:grid-cols-2">
          @for (item of cases(); track item.id) {
            <a [routerLink]="['/app/cases', item.id]" class="md-card block p-4 transition hover:-translate-y-0.5">
              <p class="text-xs font-semibold tracking-wide text-sky-700">{{ item.code }}</p>
              <h2 class="mt-1 text-base font-semibold text-slate-900">{{ item.title }}</h2>
              <p class="mt-1 text-sm text-slate-600">{{ item.status }} - {{ item.openedAt | date: 'mediumDate' }}</p>
              <p class="mt-2 truncate text-xs text-slate-500">{{ item.id }}</p>
            </a>
          }
        </section>

        <div class="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
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
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly listCasesUseCase = inject(ListCasesUseCase);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly cases = signal<CaseModel[]>([]);
  protected readonly page = signal(1);
  protected readonly limit = signal(10);
  protected readonly total = signal(0);
  protected readonly hasNext = signal(false);

  constructor() {
    this.loadCases(1);
  }

  protected reload(): void {
    this.loadCases(this.page());
  }

  protected goToPage(page: number): void {
    if (page < 1 || (page !== this.page() && page > this.page() && !this.hasNext())) {
      return;
    }

    this.loadCases(page);
  }

  private loadCases(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.listCasesUseCase
      .execute({
        page,
        limit: this.limit(),
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
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.error.set(this.mapError(error));
        },
      });
  }

  private mapError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No fue posible cargar los expedientes.';
    }

    if (error.status === 0) {
      return 'No hay conexion con el backend.';
    }

    return 'Error consultando expedientes. Verifica backend y base de datos.';
  }
}
