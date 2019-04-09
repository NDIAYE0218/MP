import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class DirectionService {
  uri = 'http://localhost:4000';

  constructor(private http: HttpClient) { }
  getDirections() {
    return this.http.get(`${this.uri}/directions`);
}

getService(NomDG){
  return this.http.get(`${this.uri}/Service/`+NomDG);
}
creeDirections(NumDG,Nom){
  const Direction={
    NumDG: NumDG,
    Nom: Nom
  }
  return this.http.post(`${this.uri}/Direction`, Direction);

}

creeservice(NumServ,NomDG,Nom){
  const Service={
    NumServ:  NumServ,
    NomDG: NomDG,
    Nom: Nom
  }
  return this.http.post(`${this.uri}/Service`, Service);
}
}
