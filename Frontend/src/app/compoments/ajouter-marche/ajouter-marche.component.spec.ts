import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterMarcheComponent } from './ajouter-marche.component';

describe('AjouterMarcheComponent', () => {
  let component: AjouterMarcheComponent;
  let fixture: ComponentFixture<AjouterMarcheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjouterMarcheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterMarcheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
