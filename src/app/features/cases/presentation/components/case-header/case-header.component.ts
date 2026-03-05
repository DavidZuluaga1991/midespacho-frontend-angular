import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CaseModel } from '../../../domain/models/case.model';

@Component({
  selector: 'app-case-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './case-header.component.html',
  styleUrl: './case-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseHeaderComponent {
  @Input({ required: true }) caseDetail!: CaseModel;
  @Input() totalFiles = 0;
  @Input() totalBatches = 0;
  @Input() lastUpdate: Date | null = null;

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
}
