import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class MarcheService {
  uri = 'http://localhost:4000';
  nb_pre=0 //nbre de mois a soustraire de la date de cloture
  ns_pre=0 //nbre de semaine a soustraire de la date de cloture
  constructor(private http: HttpClient) { }

  CreerMarcher(Marche) {
    console.log(Marche)
    return this.http.post(`${this.uri}/Marche`, Marche).subscribe(
      error => console.log('oops', error)
    );
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
    return this.http.put(`${this.uri}/Marche/` + id, historique).subscribe(
      error => console.log('oops', error)
    );
  }
  generateur_date(dte, nb_mois, nbr_rec) {//dte représente la date du debut du marchéet nb_mois le nombre de mois (duré initiale du marché), et le nombre de reconduction pour estimer la valeur d'une periode
    var format = dte.split('/');
    dte = format[1] + "/" + format[0] + "/" + format[2]
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
     * Première alerte 6mois avan la date de cloture  si pas de reconduction et duré marché supperieur a 6 mois
     * Première alerte 1 mois avan la date de cloture si pas de reconduction et duré marché compris entre 6 et 1 mois
     * Première alerte 2 semaines avan la date de cloture si pas de reconduction et duré marché égal a un mois
     * Première alerte 4mois avan la date de cloture  si reconduction et duré d'une reconduction supperieur a 4 mois
     * Première alerte 1 mois avan la date de cloture si reconduction et duré  d'une reconduction compris entre 4 et 1 mois
     * Première alerte 2 semaines avan la date de cloture si reconduction et duré  d'une reconduction &gal a un mois
     **/
    var dure_rec = nb_mois / nbr_rec
    this.nb_pre = (nbr_rec == 0 && nb_mois > 6) ? 6 : (nbr_rec > 0) ? ((dure_rec > 4)? 4 + (dure_rec * (nbr_rec - 1)): (dure_rec < 4 && dure_rec > 1) ? 1 + (dure_rec * (nbr_rec - 1)) : (dure_rec * (nbr_rec - 1))) : (nbr_rec == 0 && nb_mois < 6 && nb_mois > 1) ? 1 : 0
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