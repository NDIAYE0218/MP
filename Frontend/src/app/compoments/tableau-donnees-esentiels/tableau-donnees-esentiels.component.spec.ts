import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauDonneesEsentielsComponent } from './tableau-donnees-esentiels.component';

describe('TableauDonneesEsentielsComponent', () => {
  let component: TableauDonneesEsentielsComponent;
  let fixture: ComponentFixture<TableauDonneesEsentielsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableauDonneesEsentielsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableauDonneesEsentielsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
