import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterUsersComponent } from './ajouter-users.component';

describe('AjouterUsersComponent', () => {
  let component: AjouterUsersComponent;
  let fixture: ComponentFixture<AjouterUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjouterUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
