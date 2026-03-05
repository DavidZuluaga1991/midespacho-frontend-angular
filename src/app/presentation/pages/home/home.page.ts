import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="mx-auto max-w-3xl p-6">
      <h1 class="text-2xl font-semibold text-slate-900">MiDespacho Frontend</h1>
      <p class="mt-2 text-slate-600">
        Base de arquitectura (Fase 6) preparada. Usa la ruta de expediente para probar integracion:
      </p>
      <a class="mt-4 inline-block text-sm font-medium text-sky-700 underline" [routerLink]="['/app/cases', sampleCaseId]">
        Abrir expediente de ejemplo
      </a>
      <p class="mt-2 text-xs text-slate-500">Sample ID: {{ sampleCaseId }}</p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly sampleCaseId = '00000000-0000-0000-0000-000000000000';
}

