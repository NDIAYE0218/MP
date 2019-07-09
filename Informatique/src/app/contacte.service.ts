import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ContacteService {
  //uri = 'http://amp.mairie-clichy.fr:4000';
  uri = 'http://localhost:4000';

  constructor(private http: HttpClient) { }
  CreateContacte(NomDir,NumServ,Nom,Prenom,Email){
    const Contact={
      NumServ: NumServ,NomDir,
      Nom:    Nom,
      Prenom: Prenom,
      Email:  Email
    }
    return this.http.post(`${this.uri}/Contacte`, Contact).subscribe(
      data => console.log('success', data),
      error => console.log('oops', error)
    );
  }
  getContacte(id_ser){
    return this.http.get(`${this.uri}/Contacte/`+id_ser);
  }
}
