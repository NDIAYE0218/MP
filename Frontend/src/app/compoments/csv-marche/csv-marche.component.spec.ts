import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvMarcheComponent } from './csv-marche.component';

describe('CsvMarcheComponent', () => {
  let component: CsvMarcheComponent;
  let fixture: ComponentFixture<CsvMarcheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvMarcheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvMarcheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
