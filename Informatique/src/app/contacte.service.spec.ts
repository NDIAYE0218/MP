import { TestBed,inject } from '@angular/core/testing';

import { ContacteService } from './contacte.service';

describe('ContacteService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ContacteService]
  }));

  it('should be created',inject([ContacteService],(service: ContacteService)=>{
    expect(service).toBeTruthy();
  }))
});
