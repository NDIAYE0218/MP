import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterDirectionComponent } from './ajouter-direction.component';

describe('AjouterDirectionComponent', () => {
  let component: AjouterDirectionComponent;
  let fixture: ComponentFixture<AjouterDirectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjouterDirectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterDirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
