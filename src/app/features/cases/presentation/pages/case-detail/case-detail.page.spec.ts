import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadCaseDetailUseCase } from '../../../application/use-cases/load-case-detail.use-case';
import { ListCaseFilesUseCase } from '../../../application/use-cases/list-case-files.use-case';
import { UploadCaseFilesUseCase } from '../../../application/use-cases/upload-case-files.use-case';
import { CaseDetailPage } from './case-detail.page';

describe('CaseDetailPage', () => {
  let fixture: ComponentFixture<CaseDetailPage>;
  let routeParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let loadCaseDetailUseCaseSpy: jasmine.SpyObj<LoadCaseDetailUseCase>;
  let listCaseFilesUseCaseSpy: jasmine.SpyObj<ListCaseFilesUseCase>;
  let uploadCaseFilesUseCaseSpy: jasmine.SpyObj<UploadCaseFilesUseCase>;

  beforeEach(async () => {
    routeParamMap$ = new BehaviorSubject(convertToParamMap({ id: 'case-1' }));
    loadCaseDetailUseCaseSpy = jasmine.createSpyObj<LoadCaseDetailUseCase>('LoadCaseDetailUseCase', ['execute']);
    listCaseFilesUseCaseSpy = jasmine.createSpyObj<ListCaseFilesUseCase>('ListCaseFilesUseCase', ['execute']);
    uploadCaseFilesUseCaseSpy = jasmine.createSpyObj<UploadCaseFilesUseCase>('UploadCaseFilesUseCase', ['execute']);

    loadCaseDetailUseCaseSpy.execute.and.returnValue(
      of({
        id: 'case-1',
        code: 'EXP-1',
        title: 'Proceso laboral',
        description: null,
        status: 'OPEN',
        openedAt: new Date(),
        closedAt: null,
        clientId: 'client-1',
        createdById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    listCaseFilesUseCaseSpy.execute.and.returnValues(
      of({
        data: [],
        meta: { page: 1, limit: 20, total: 0, hasNext: false },
      }),
      of({
        data: [
          {
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
          },
        ],
        meta: { page: 1, limit: 20, total: 1, hasNext: false },
      }),
    );
    uploadCaseFilesUseCaseSpy.execute.and.returnValue(
      of({
        batch: {
          id: 'batch-1',
          caseId: 'case-1',
          title: 'Lote inicial',
          description: 'Descripcion',
          uploadedById: null,
          createdAt: new Date(),
        },
        files: [
          {
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
          },
        ],
      }),
    );

    await TestBed.configureTestingModule({
      imports: [CaseDetailPage],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: routeParamMap$.asObservable(),
          },
        },
        { provide: LoadCaseDetailUseCase, useValue: loadCaseDetailUseCaseSpy },
        { provide: ListCaseFilesUseCase, useValue: listCaseFilesUseCaseSpy },
        { provide: UploadCaseFilesUseCase, useValue: uploadCaseFilesUseCaseSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseDetailPage);
    fixture.detectChanges();
  });

  it('should load case detail and files on route entry', () => {
    expect(loadCaseDetailUseCaseSpy.execute).toHaveBeenCalledWith('case-1');
    expect(listCaseFilesUseCaseSpy.execute).toHaveBeenCalledWith({
      caseId: 'case-1',
      page: 1,
      limit: 20,
    });
  });

  it('should refresh files after successful upload', () => {
    (fixture.componentInstance as any).onSubmitBatch({
      batchTitle: 'Lote inicial',
      batchDescription: 'Descripcion del lote',
      files: [new File(['x'], 'x.txt', { type: 'text/plain' })],
    });

    expect(uploadCaseFilesUseCaseSpy.execute).toHaveBeenCalled();
    expect(listCaseFilesUseCaseSpy.execute).toHaveBeenCalledTimes(2);
    expect((fixture.componentInstance as any).uploadSuccessMessage()).toContain('1 archivo(s)');
    expect((fixture.componentInstance as any).files().length).toBe(1);
  });

  it('should map permission errors on upload', () => {
    uploadCaseFilesUseCaseSpy.execute.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'Forbidden' } })),
    );

    (fixture.componentInstance as any).onSubmitBatch({
      batchTitle: 'Lote inicial',
      batchDescription: 'Descripcion del lote',
      files: [new File(['x'], 'x.txt', { type: 'text/plain' })],
    });

    expect((fixture.componentInstance as any).uploadErrorMessage()).toContain('No tienes permisos');
  });
});
