import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FilesListComponent } from './files-list.component';
import { CaseFileModel } from '../../../domain/models/case-file.model';

const fileFixture: CaseFileModel = {
  id: 'file-1',
  caseId: 'case-1',
  batchId: 'batch-1',
  originalName: 'demanda.pdf',
  storedName: 'stored-demanda',
  mimeType: 'application/pdf',
  sizeBytes: '1024',
  storageProvider: 'local',
  storageKey: 'stored-demanda',
  publicUrl: 'http://localhost/uploads/stored-demanda',
  uploadedById: null,
  createdAt: new Date(),
};

describe('FilesListComponent', () => {
  let fixture: ComponentFixture<FilesListComponent>;
  let component: FilesListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesListComponent);
    component = fixture.componentInstance;
  });

  it('should render empty state', () => {
    component.loading = false;
    component.error = null;
    component.files = [];
    component.total = 0;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aun no hay archivos');
  });

  it('should render error state', () => {
    component.loading = false;
    component.error = 'Error de red';
    component.files = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Error de red');
  });

  it('should render data state with file row', () => {
    component.loading = false;
    component.error = null;
    component.files = [fileFixture];
    component.total = 1;
    component.page = 1;
    component.hasNext = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('demanda.pdf');
    expect(fixture.nativeElement.textContent).toContain('Pagina 1 - 1 registros');
  });

  it('should emit next page on pagination click', () => {
    const emitSpy = spyOn(component.pageChange, 'emit');
    component.loading = false;
    component.error = null;
    component.files = [fileFixture];
    component.total = 30;
    component.page = 1;
    component.hasNext = true;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const nextButton = buttons[1] as HTMLButtonElement;
    nextButton.click();

    expect(emitSpy).toHaveBeenCalledWith(2);
  });
});
