import { Component, OnInit } from '@angular/core';
import {MarcheService} from '../../marche.service'
import {ExcelService} from '../../excel.service'
import swal from 'sweetalert2';
@Component({
  selector: 'app-tableau-donnees-esentiels',
  templateUrl: './tableau-donnees-esentiels.component.html',
  styleUrls: ['./tableau-donnees-esentiels.component.css']
})
export class TableauDonneesEsentielsComponent implements OnInit {
  Ans=[]
  constructor(private marcheservice:MarcheService, private exelservice:ExcelService) { }
  ngOnInit() {
    this.generateAn()
  }
  genererTableau(an){
    this.marcheservice.recherher(an).subscribe((data:any)=>{
      if(data.length>0)
      this.exelservice.exportAsExcelFile(this.formatage_data(data),'test')
      else
      swal({type:"warning",text:"Aucune données de disponible pour cette année"})
    })
  }
  formatage_data(data){
    var Data=[]
    for(var i=0;i<data.length;i++){
      var data_line={
        "Le numéro de marché":data[i].An+"-"+this.generate_id(data[i].NumMarche),
        "La date de notification": this.getDate(data[i].Date_debut),
        "date de publication des données essentielles":this.getDate(data[i].Datecreation),
        "nom de l'acheteur ou du mandataire en cas de groupement":(typeof data[i].serv !="undefined")?data[i].DG+ " ("+data[i].serv+")":data[i].DG,
        "numéro SIRET de l'acheteur":"",//data[i].Titulaire[0].SIRET,
        "nature du marché public":data[i].Nature,
        "L'objet du marché":data[i].objet,
        "Le principal code du Vocabulaire":"",
        "La procédure de passation utilisée ":data[i].Type_process,
        "Le nom du lieu principal d'exécution":"CLICHY-LA-GARENNE",
        "code postal du lieu principal d'exécution ":"92110",
        "La durée du marché public initial en nombre de mois":data[i].D_init,
        "Le montant HT forfaitaire ou estimé maximum en €":data[i].Montant_Max_HT_glob,
        "La forme du prix du marché public correspondant à l'une des mentions suivantes":data[i].Type_Marche,
        "Le nom du ou des titulaires du marché public ":this.getTitulaire(data[i].Titulaire,1),
        "Etablissements du ou des titulaire ":this.getTitulaire(data[i].Titulaire,0)
      }
      Data.push(data_line)
    }
    return Data
  }
  generate_id(num){
    num=num+""
    return (num.length==3)?num:(num.length==2)?"0"+num:"00"+num
  }
  getDate(dte) {
    if(typeof dte!='undefined')
    {
      if(dte.includes("$$"))
      var event = new Date(dte.split('$$')[0])
      else
      var event = new Date(dte.split('/')[2]+"-"+dte.split('/')[1]+"-"+dte.split('/')[0])
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return event.toLocaleDateString('fr-FR', options)
    } 
    else
    return "date non definit"
  }
  getTitulaire(data,option){
    var ret=""
    for(var i=0;i<data.length;i++)
    if(option)
    ret+=data[i].Nom+", "
    else
    ret+=data[i].Adresse
  }
  generateAn(){
    var event = new Date();
    var an=event.getFullYear()-10
    for(var i=0;i<11;i++)
      this.Ans.push({value:parseInt(((an+i)+"").substring(2)),affiche:an+i})
  }
}
