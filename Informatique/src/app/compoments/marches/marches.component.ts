import { Component, OnInit } from '@angular/core';
import { MarcheService } from '../../marche.service'
import swal from 'sweetalert2';
import * as jsPDF from 'jspdf'
import {ExcelService} from '../../excel.service'
@Component({
  selector: 'app-marches',
  templateUrl: './marches.component.html',
  styleUrls: ['./marches.component.css']
})
export class MarchesComponent implements OnInit {
  ColumnsDates = ['NumMarche', 'objet', 'Titulaire', 'Montant', 'Date_notif',  'duree', 'dte_fin', 'mois_rest', 'recond', 'observation', 'act']
  marches=[]
  petite_borne=0
  grande_borne=15
  taille_tot
  constructor(private marcheservice: MarcheService,private exelservice:ExcelService) { }
  ngOnInit() {
    this.fetchdata()
  }
  fetchdata(){this.marcheservice.getMarches({}).subscribe((data:any)=>{
    this.marches=this.trieur(data)
    this.taille_tot=data.length
  })}
  verif(element){return typeof element.Num_nonExo!='undefined'}
  getDate(dte) {
    if (typeof dte != 'undefined') {
      if (dte.includes("$$"))
        var event = new Date(dte.split('$$')[0])
      else
        var event = new Date(dte.split('/')[2] + "-" + dte.split('/')[1] + "-" + dte.split('/')[0])
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return event.toLocaleDateString('fr-FR', options)
    }
    else
      return "date non definit"
  }
  mois_restant(dte_fin){
    var dte=new Date()
    var dte_finn=new Date(dte_fin.split('/')[2]+"-"+dte_fin.split('/')[1]+"-"+dte_fin.split('/')[0])
	  var diffTime = Math.abs(dte_finn.getTime()- dte.getTime())
    var diff = Math.ceil(diffTime / (1000 * 60 * 60 * 24*31)) 
  	return (dte_finn.getFullYear()<dte.getFullYear())?0: diff;
  }
  delete(_id){
    swal({
      title: "Êtes vous sûr?",
      text: "Vous êtes sur le point de supprimer un contrat ",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Retour',
      confirmButtonText: 'Oui, supprimer'
    }).then((result) => {
      if (result.value) {
      this.marcheservice.deleteMarches(_id).subscribe(()=>{this.fetchdata()})}
    })
  }
  Telecharger(element){
    var num_marche = (element.NumMarche.toString().length == 1 && !this.verif(element)) ? element.An + "-00" + element.NumMarche : (element.NumMarche.toString().length == 2 && !this.verif(element)) ? element.An + "-0" + element.NumMarche :(typeof element.Num_nonExo!='undefined')?element.Num_nonExo: element.An + "-" + element.NumMarche + ""
    var doc = new jsPDF();
    doc.setFontSize(30); doc.setTextColor(0, 0, 255); doc.text(70, 20, 'Marché n°' + num_marche);
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
    var long=35
    doc.setFontType('bold'); doc.text(30, long+5, 'Objet:'); doc.setFontType(''); doc.text(78, long+5, element.Objet)
    doc.setFontType('bold'); doc.text(30, long+10, 'Nom titulaire:'); doc.setFontType(''); doc.text(78, long+10, element.NomTitulaire)
    doc.setFontType('bold'); doc.text(30, long+15, 'Email titulaire:'); doc.setFontType(''); doc.text(78, long+15, element.Mail)
    doc.setFontType('bold'); doc.text(30, long+20, 'N° telephone titulaire:'); doc.setFontType(''); doc.text(78, long+20, element.Tel)
    doc.setFontType('bold'); doc.text(30, long+25, 'Adresse titulaire:'); doc.setFontType(''); doc.text(78, long+25, element.Adresse+" "+element.CP)
    doc.setFontType('bold'); doc.text(30, long+30, 'Montant TTC (€):'); doc.setFontType(''); doc.text(78, long+30, element.Montant+" ")
    doc.setFontType('bold'); doc.text(30, long+35, 'Date Notification:'); doc.setFontType(''); doc.text(78, long+35, element.DateNotification)
    doc.setFontType('bold'); doc.text(30, long+40, 'Montant:'); doc.setFontType(''); doc.text(78, long+40, element.Duree+" ")
    doc.setFontType('bold'); doc.text(30, long+45, 'Date Notification:'); doc.setFontType(''); doc.text(78, long+45, element.DateFin)
    doc.setFontType('bold'); doc.text(30, long+50, 'Mois restant:'); doc.setFontType(''); doc.text(78, long+50, this.mois_restant(element.DateFin)+"")
    doc.setFontType('bold'); doc.text(30, long+55, 'Reconduction:'); doc.setFontType(''); doc.text(78, long+55, element.TypeReconduction)
    doc.setFontType('bold'); doc.text(30, long+60, 'Observation:'); doc.setFontType(''); doc.text(78, long+60, element.Observation)
    doc.save('Marche' + num_marche + '.pdf');
  }
  suivant_born(){
    if(this.grande_borne>=this.taille_tot){
      this.petite_borne=0
      this.grande_borne=15
    }
    else{
      this.petite_borne+=15
      this.grande_borne+=15
    }
    setTimeout(()=>{this.fetchdata()},100)
  }
  prec_born(){
    if(this.petite_borne<=0){
      var k=(this.taille_tot%15!=0)?(15-(this.taille_tot%15))+this.taille_tot:this.taille_tot
      this.petite_borne=k-15
      this.grande_borne=k
    }
    else{
      this.petite_borne-=15
      this.grande_borne-=15
    }
    setTimeout(()=>{this.fetchdata()},100)
  }
  trieur(data){
    var lim=(this.grande_borne>=data.length)?data.length:this.grande_borne
    var ret=[]
    for(var i=this.petite_borne;i<lim;i++){
      ret.push(data[i])
    }
    return ret
  }
  rechercher(ID_rech){
    var an=(ID_rech.includes('-'))?parseInt(ID_rech.split('-')[0]):0;var num=(ID_rech.includes('-'))?parseInt(ID_rech.split('-')[1]):0
    this.marcheservice.getMarches({$or:[{Num_nonExo:ID_rech},{An:an,NumMarche:num}]}).subscribe((data:any)=>{
      this.marches=data
    })
  }
  Exel(){
    this.marcheservice.getMarches({}).subscribe((data:any)=>{
      var marche=[]
      for(var i=0;i<data.length;i++){
        marche.push(
          {
            "N°":(data[i].NumMarche.toString().length == 1 && !this.verif(data[i])) ? data[i].An + "-00" + data[i].NumMarche : (data[i].NumMarche.toString().length == 2 && !this.verif(data[i])) ? data[i].An + "-0" + data[i].NumMarche :(typeof data[i].Num_nonExo!='undefined')?data[i].Num_nonExo: data[i].An + "-" + data[i].NumMarche + "",
            "Objet":data[i].Objet,
            "Info titulaire":data[i].NomTitulaire+"  "+data[i].Tel+"  "+data[i].Mail+"  "+data[i].Adresse+"  "+data[i].CP,
            "Montant TTC (€)":data[i].Montant,
            "Date de Notification":data[i].DateNotification,
            "Durée":data[i].Duree,
            "Date fin":data[i].DateFin,
            "Mois restant":this.mois_restant(data[i].DateFin),
            "Reconduction":data[i].TypeReconduction,
            "Observation":data[i].Observation,
          }
        )
      }
      this.exelservice.exportAsExcelFile(marche,'MarcheDSI')
    })
  }
}
