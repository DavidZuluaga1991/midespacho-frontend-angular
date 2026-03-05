import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CaseFileModel } from '../../../domain/models/case-file.model';

@Component({
  selector: 'app-files-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './files-list.component.html',
  styleUrl: './files-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesListComponent {
  @Input() files: CaseFileModel[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() page = 1;
  @Input() limit = 20;
  @Input() total = 0;
  @Input() hasNext = false;
  @Output() pageChange = new EventEmitter<number>();

  protected formatFileSize(sizeBytes: string): string {
    const bytes = Number(sizeBytes);
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return '-';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  }

  protected fileTypeLabel(mimeType: string): string {
    if (mimeType.includes('pdf')) {
      return 'PDF';
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return 'DOC';
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return 'XLS';
    }
    if (mimeType.includes('image')) {
      return 'IMG';
    }
    return 'FILE';
  }

  protected onPrevPage(): void {
    if (this.loading || this.page <= 1) {
      return;
    }
    this.pageChange.emit(this.page - 1);
  }

  protected onNextPage(): void {
    if (this.loading || !this.hasNext) {
      return;
    }
    this.pageChange.emit(this.page + 1);
  }
}
