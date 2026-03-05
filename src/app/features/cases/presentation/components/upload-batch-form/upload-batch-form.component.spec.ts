import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { UploadBatchFormComponent } from './upload-batch-form.component';

describe('UploadBatchFormComponent', () => {
  let fixture: ComponentFixture<UploadBatchFormComponent>;
  let component: UploadBatchFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadBatchFormComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadBatchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not emit when form is invalid', () => {
    const emitSpy = spyOn(component.submitBatch, 'emit');

    (component as any).submit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect((component as any).form.invalid).toBeTrue();
  });

  it('should emit batch payload when form is valid and files are selected', () => {
    const emitSpy = spyOn(component.submitBatch, 'emit');
    const form = (component as any).form;
    form.controls.batchTitle.setValue('Lote Inicial');
    form.controls.batchDescription.setValue('Descripcion valida para el lote inicial.');

    const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    (component as any).onFilesSelected({ target: input } as unknown as Event);

    (component as any).submit();

    expect(emitSpy).toHaveBeenCalledWith({
      batchTitle: 'Lote Inicial',
      batchDescription: 'Descripcion valida para el lote inicial.',
      files: [file],
    });
  });

  it('should show local error when file size exceeds max limit', () => {
    component.maxFileSizeMb = 1;
    fixture.detectChanges();

    const bigFile = new File([new Uint8Array(2 * 1024 * 1024)], 'big.bin', {
      type: 'application/octet-stream',
    });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [bigFile] });

    (component as any).onFilesSelected({ target: input } as unknown as Event);

    expect((component as any).localError()).toContain('supera 1 MB');
  });
});
