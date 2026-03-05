import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface UploadBatchFormSubmitEvent {
  batchTitle: string;
  batchDescription: string;
  files: File[];
}

@Component({
  selector: 'app-upload-batch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-batch-form.component.html',
  styleUrl: './upload-batch-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadBatchFormComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);

  @Input() disabled = false;
  @Input() uploading = false;
  @Input() resetKey = 0;
  @Input() maxFiles = 20;
  @Input() maxFileSizeMb = 15;
  @Output() submitBatch = new EventEmitter<UploadBatchFormSubmitEvent>();

  protected readonly dragOver = signal(false);
  protected readonly localError = signal<string | null>(null);
  protected readonly selectedFiles = signal<File[]>([]);

  protected readonly form = this.formBuilder.nonNullable.group({
    batchTitle: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    batchDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetKey'] && !changes['resetKey'].firstChange) {
      this.resetForm();
    }
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.applySelectedFiles(files, false);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.applySelectedFiles(files, true);
  }

  protected openFileDialog(input: HTMLInputElement): void {
    if (this.disabled || this.uploading) {
      return;
    }
    input.click();
  }

  protected removeFile(index: number): void {
    const current = this.selectedFiles();
    const next = current.filter((_, fileIndex) => fileIndex !== index);
    this.selectedFiles.set(next);
  }

  protected submit(): void {
    this.localError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const files = this.selectedFiles();
    if (!files.length) {
      this.localError.set('Debes seleccionar al menos un archivo.');
      return;
    }

    this.submitBatch.emit({
      batchTitle: this.form.controls.batchTitle.value.trim(),
      batchDescription: this.form.controls.batchDescription.value.trim(),
      files,
    });
  }

  private applySelectedFiles(files: File[], replace: boolean): void {
    this.localError.set(null);
    const baseFiles = replace ? [] : this.selectedFiles();
    const merged = [...baseFiles, ...files];

    if (!merged.length) {
      this.selectedFiles.set([]);
      return;
    }

    if (merged.length > this.maxFiles) {
      this.localError.set(`Solo puedes cargar hasta ${this.maxFiles} archivos por lote.`);
      return;
    }

    const maxSizeBytes = this.maxFileSizeMb * 1024 * 1024;
    const invalidBySize = merged.find((file) => file.size > maxSizeBytes);
    if (invalidBySize) {
      this.localError.set(`El archivo "${invalidBySize.name}" supera ${this.maxFileSizeMb} MB.`);
      return;
    }

    this.selectedFiles.set(merged);
  }

  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  }

  private resetForm(): void {
    this.form.reset();
    this.selectedFiles.set([]);
    this.localError.set(null);
    this.dragOver.set(false);
  }
}
