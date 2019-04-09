import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarchesComponent } from './marches.component';

describe('MarchesComponent', () => {
  let component: MarchesComponent;
  let fixture: ComponentFixture<MarchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarchesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
