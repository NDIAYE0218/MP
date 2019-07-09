import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class DirectionService {
  uri = 'http://amp.mairie-clichy.fr:4000';
  // uri = 'http://localhost:4000';

  constructor(private http: HttpClient) { }
  getDirections() {
    return this.http.get(`${this.uri}/directions`);
}

getService(NomDG){
  return this.http.get(`${this.uri}/Service/`+NomDG);
}
creeDirections(Nom){
  const Direction={
  Nom: Nom
  }
  return this.http.post(`${this.uri}/Direction`, Direction);

}

creeservice(NomDG,Nom){
  const Service={
    NomDG: NomDG,
    Nom: Nom
  }
  return this.http.post(`${this.uri}/Service`, Service);
}
}
