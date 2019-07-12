import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class MarcheService {
  uri = 'http://amp.mairie-clichy.fr:4000';
  // uri = 'http://localhost:4000';
  nb_pre=0 //nbre de mois a soustraire de la date de cloture
  ns_pre=0 //nbre de semaine a soustraire de la date de cloture
  constructor(private http: HttpClient) { }
  CreerMarcher(Marche) {
    return this.http.post(`${this.uri}/Informatique/marche`, Marche);
  }

  getMarches(recherche) {
    return this.http.post(`${this.uri}/Informatique/marches`,recherche)
  }
  updateMarches(marche) {
    return this.http.put(`${this.uri}/Informatique/marche`,marche);
  }
  deleteMarches(_id){
    return this.http.delete(`${this.uri}/Informatique/marche/`+_id);
  }
}