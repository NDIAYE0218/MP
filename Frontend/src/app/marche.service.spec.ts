import { TestBed,inject  } from '@angular/core/testing';

import { MarcheService } from './marche.service';

describe('MarcheService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [MarcheService]
  })
  );

  it('should be created', inject([MarcheService],(service: MarcheService)=>{
    expect(service).toBeTruthy();
  }))
});
