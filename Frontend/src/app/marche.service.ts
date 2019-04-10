import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class MarcheService {
  uri = 'http://localhost:4000';
  constructor(private http: HttpClient) { }

  CreerMarcher(Marche){  
    console.log(Marche)
   return this.http.post(`${this.uri}/Marche`, Marche).subscribe(
    error => console.log('oops', error)
  );
  }

getMarches(){
  return this.http.get(`${this.uri}/Marches`)
}
getMarche(numMarche,An){
  return this.http.get(`${this.uri}/Marche/`+numMarche+`/`+An)
}
recherher(An){
  return this.http.get(`${this.uri}/Marches/`+An)
}
deleteMarches(num,an){
  //var ident=an+'-'+num
  return this.http.delete(`${this.uri}/Marches/`+an+`/`+num)
}
updateMarches(historique,id){
  return this.http.put(`${this.uri}/Marche/`+id, historique).subscribe(
   error => console.log('oops', error)
 );
}
generateur_date(dte,nb_mois,nbr_rec){//dte représente la date du debut du marchéet nb_mois le nombre de mois (duré initiale du marché), et le nombre de reconduction pour estimer la valeur d'une periode
  var format=dte.split('/');
  dte=format[1]+"/"+format[0]+"/"+format[2]
  //calcule de la date de cloture
  var dateclo= new Date(dte)
  dateclo.setFullYear(dateclo.getFullYear()+(nb_mois%12))//nbre d'année de la duré plus 
  dateclo.setMonth(dateclo.getMonth()+(nb_mois-((nb_mois%12)*12)));//date cloture = date_debut+ duré initiale
  let month = String(dateclo.getMonth()+1);
  let day = String(dateclo.getDate());
  let year = String(dateclo.getFullYear());
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  var dte_clo=day+"/"+month+"/"+year
  //fin
  //calcule date de 1er notification
  nb_mois=Math.floor(nb_mois/nbr_rec)// la duré d'une reconduction
  nb_mois= Math.floor(nb_mois/3); //la première notification seras generé 1/3 du temps avant la fin de la 1er reconduction
  dateclo.setMonth(dateclo.getMonth()-nb_mois);
  month = String(dateclo.getMonth()+1);
  day = String(dateclo.getDate());
  year = String(dateclo.getFullYear());
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
 var dte_notif= day+"/"+month+"/"+year;
  return {dte_clo:dte_clo,dte_notif:dte_notif}
}
}
