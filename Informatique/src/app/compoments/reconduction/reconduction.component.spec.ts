import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconductionComponent } from './reconduction.component';

describe('ReconductionComponent', () => {
  let component: ReconductionComponent;
  let fixture: ComponentFixture<ReconductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReconductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
