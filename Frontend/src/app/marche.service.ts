import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class MarcheService {
  uri = 'http://10.75.87.133:4000';
  nb_pre=0 //nbre de mois a soustraire de la date de cloture
  ns_pre=0 //nbre de semaine a soustraire de la date de cloture
  constructor(private http: HttpClient) { }

  Statistiques(option){
    return this.http.get(`${this.uri}/Statistiques/`+option)
  }
  CreerMarcher(Marche) {
    return this.http.post(`${this.uri}/Marche`, Marche);
  }

  getMarches() {
    return this.http.get(`${this.uri}/Marches`)
  }
  getMarche(numMarche, An) {
    return this.http.get(`${this.uri}/Marche/` + numMarche + `/` + An)
  }
  recherher(An) {
    return this.http.get(`${this.uri}/Marches/` + An)
  }
  deleteMarches(num, an) {
    //var ident=an+'-'+num
    return this.http.delete(`${this.uri}/Marches/` + an + `/` + num)
  }
  updateMarches(historique, id) {
    return this.http.put(`${this.uri}/Marche/` + id, historique).subscribe();
  }
  reconductionExpresse(_id){
    return this.http.get(`${this.uri}/Marches/reconduire/` + _id)
  }
  generateur_date(dte, nb_mois, nbr_rec) {//dte représente la date du debut du marchéet nb_mois le nombre de mois (duré initiale du marché), et le nombre de reconduction pour estimer la valeur d'une periode
    //calcule de la date de cloture
    var dateclo = new Date(dte)
    dateclo.setFullYear(dateclo.getFullYear() + (nb_mois % 12))//nbre d'année de la duré plus 
    dateclo.setMonth(dateclo.getMonth() + (nb_mois - ((nb_mois % 12) * 12)));//date cloture = date_debut+ duré initiale
    let month = String(dateclo.getMonth() + 1);
    let day = String(dateclo.getDate());
    let year = String(dateclo.getFullYear());
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var dte_clo = day + "/" + month + "/" + year
    //fin
    /**
     * REGLE DE CALCUL DE LA DATE DE NOTIFICATION
     * Première alerte 6mois avan la date de cloture  si nombre de reconduction est egal a 0
     * Première alerte 4 mois avan la date de cloture si nombre de reconduction est supperieur a 0
     * sinon un moi avan la date de cloture
     **/
    var dure_rec = nb_mois
    this.nb_pre = (nb_mois>6 && nbr_rec==1)?6:(nb_mois>6 && nbr_rec>1)?4:1
    this.ns_pre=(nb_mois ==1)? 14:0
    dateclo.setMonth(dateclo.getMonth()-this.nb_pre) //calcule mois de notification
    dateclo.setDate(dateclo.getDate()-this.ns_pre)
    month = String(dateclo.getMonth()+1);
    day = String(dateclo.getDate());
    year = String(dateclo.getFullYear());
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var dte_notif = day + "/" + month + "/" + year;
    return { dte_clo: dte_clo, dte_notif: dte_notif }
  }
}