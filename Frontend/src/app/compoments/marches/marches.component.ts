import { Component, OnInit } from '@angular/core';
import { Marches } from '../../Models/marche.model'
import { MarcheService } from '../../marche.service'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import swal from 'sweetalert2';
import {UserService} from '../../user.service'
import * as jsPDF from 'jspdf'
@Component({
  selector: 'app-marches',
  templateUrl: './marches.component.html',
  styleUrls: ['./marches.component.css']
})
export class MarchesComponent implements OnInit {
  createForm: FormGroup;
  marches: Marches[];
  ColumnsInformation = ['NumMarche', 'objet', 'nature', 'procedure', 'typeMarche', 'act']
  ColumnsMontant = ['NumMarche', 'objet', 'typeMarche', 'montantmin', 'montantdeb', 'montantmax', 'act']
  ColumnsDirection = ['NumMarche', 'objet', 'DG', 'serv', 'Contacte', 'act'];
  ColumnsDates = ['NumMarche', 'objet', 'dte_not', 'dte_clo', 'duree', 'tot_recond', 'duree_total', 'act']
  ColumsTitulaire = ['NumMarche', 'objet', 'Type', 'Nom', 'Nom_Contacte', 'Mail_Contacte', 'Adresse', 'act']
  ColumsFiles = ['NumMarche', 'objet', 'fichiers', 'act']
  droit=-1
  constructor(private marcheservice: MarcheService, private fb: FormBuilder, private router: Router, private userservice:UserService) {
    this.createForm = this.fb.group({
      Annee_rech: ['', [Validators.nullValidator, Validators.maxLength(4), Validators.minLength(4)]],
      ID_rech: ['', [Validators.nullValidator, Validators.maxLength(6), Validators.minLength(6)]]
    })
  }
  ngOnInit() {
    this.fetchdata()
    if(this.userservice.Access())
    this.droit=this.userservice.InfoUser().Droit
  }
  fetchdata() {
    let timerInterval
swal({
  title: 'Recherche des données',
  html: 'Veuillez patienter',
  timer: 2000,
  onBeforeOpen: () => {
    swal.showLoading()
    timerInterval = setInterval(() => {}, 100)
  },onClose: () => {clearInterval(timerInterval)}
})
    this.marcheservice.getMarches().subscribe((data: Marches[]) => {
      this.marches = data;
    })
  }
  suppmarche(An, NumMarche) {
    var numstr = (NumMarche.toString().length === 1) ? An + "-00" + NumMarche : (NumMarche.toString().length === 2) ? An + "-0" + NumMarche : An + "-" + NumMarche
    swal({
      title: "Êtes vous sûr?",
      text: "Vous êtes sur le point de supprimer le contrat " + numstr,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Retour',
      confirmButtonText: 'Oui, supprimer'
    }).then((result) => {
      if (result.value) {
        this.marcheservice.deleteMarches(An, NumMarche).subscribe()
        swal(
          'Suppression reussis!',
          "le contrat " + numstr + " a bien été supprimé",
          'success'
        ).then(() => { this.fetchdata() })
      }
    })
  }
  rechercher(anne, numero) {
    if (anne.length > 0) {
      //recherche par année
      this.marcheservice.recherher(anne.substring(8)).subscribe((data: Marches[]) => {
        if (data != null && data.length != 0)
          this.marches = data;
        else
          swal('Introuvable', 'Aucun marché ne correspond a votre recherche', 'warning')
      })
    }
    else {
      this.router.navigate(['/marches/' + numero]);
    }
  }
  modifier(marche) {
    var html = '<div style="display: inline-block;width: 200px;"><label>Montant: </label><input type="number"  required id="montant"><br></div>' +
      '<div style="display: inline-block;width: 200px;"><label>Prestation:</label><input type="text" required id="prestation"><br></div>'
    swal({
      title: "Rajout d'une nouvelle prestation",
      html: html,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#E89013',
      confirmButtonText: 'Ajouter',
      cancelButtonText: 'Retour'
    }).then((result) => {
      if (result.value) {
        var montant = (document.getElementById("montant") as HTMLTextAreaElement).value
        var prestation = (document.getElementById("prestation") as HTMLTextAreaElement).value
        var montant_rest = marche.Montant_Max - marche.MontantConsome
        if ((parseInt(montant) > montant_rest || montant_rest < 0) && marche.Montant_Max != 0)
          swal({ type: "error", title: "imposible", text: "montant restant inferieur au montant de la prestation" })
        else {
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = today.getFullYear();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          var historique = marche.historique
          historique.push({
            numModif: historique.length + 1,
            Montant: montant,
            Prestation: prestation,
            date: dd+"/"+mm+"/"+yyyy+" "+time
          })
          marche.historique=historique
          marche.MontantConsome=marche.MontantConsome+parseInt(montant)
         //modif du webservice
         this.marcheservice.updateMarches(marche,marche._id)
         this.fetchdata()
        }
      }
    })
  }
  historique(element){
    var html="<table><tr><th>Numero modification</th><th>Date</th><th>Montant</th><th>Prestation</th></tr>"
    for(var i=element.length-1;i>=0;i--)
    html+="<tr><td>"+element[i].numModif+"</td><td>"+element[i].date+"</td><td>"+element[i].Montant+"</td><td>"+element[i].Prestation+"</td></tr>"
    html+="</table>"
    swal({title:"Historique de modification",html:html,type:"info"})
  }
  Telecharger(marche){
    //definition numero du marche
    var num_marche=(marche.NumMarche.toString().length==1)?marche.An+"-00"+marche.NumMarche:(marche.NumMarche.toString().length==2)?marche.An+"-0"+marche.NumMarche:marche.An+"-"+marche.NumMarche+""
    var doc = new jsPDF();
        doc.setFontSize(30);doc.setTextColor(0, 0, 255);doc.text(70, 20, 'Marche '+num_marche);
        doc.setFontSize(15);doc.setFontType('bold');doc.setTextColor(255, 0, 0);doc.text(20, 40, 'Information général');
        doc.setFontSize(12);doc.setTextColor(0, 0, 0);
        doc.text(20, 50, 'Objet:  ');;doc.setFontType('');doc.text(40, 50, marche.objet);
        doc.setFontType('bold');doc.text(20, 55, 'Nature:');doc.setFontType('');doc.text(40, 55, marche.Nature)
        doc.setFontType('bold');doc.text(20, 60, 'Type Procedure:');doc.setFontType('');doc.text(60, 60, marche.Type_process)
        doc.setFontType('bold');doc.text(20, 65, 'Forme et type de marché:');doc.setFontType('');doc.text(70, 65, marche.Format_process+"/"+marche.Type_Marche)
        doc.setFontSize(15);doc.setFontType('bold');doc.setTextColor(255, 0, 0);doc.text(20, 75, 'Auteur');
        doc.setFontSize(12);doc.setTextColor(0, 0, 0);
        doc.setFontType('bold');doc.text(20, 80, 'Direction:');doc.setFontType('');doc.text(40, 80, marche.DG)
        doc.setFontType('bold');doc.text(20, 85, 'Service:');doc.setFontType('');doc.text(40, 85, (typeof marche.serv=="undefined")?"":marche.serv)
        doc.setFontType('bold');doc.text(20, 90, 'Contacte:');doc.setFontType('');doc.text(40, 90, marche.Contacte)
        doc.setFontSize(15);doc.setFontType('bold');doc.setTextColor(255, 0, 0);doc.text(20, 100, 'Montants');
        doc.setFontSize(12);doc.setTextColor(0, 0, 0);
        doc.setFontType('bold');doc.text(20, 105, 'Montant minimum:');doc.setFontType('');doc.text(60, 105, marche.Montant_Min+" Euros")
        doc.setFontType('bold');doc.text(20, 110, 'Montant déboursé:');doc.setFontType('');doc.text(60, 110, marche.MontantConsome+" Euros")
        doc.setFontType('bold');doc.text(20, 115, 'Montant maximum:');doc.setFontType('');doc.text(60, 115, marche.Montant_Max+" Euros")
        doc.setFontSize(15);doc.setFontType('bold');doc.setTextColor(255, 0, 0);doc.text(20, 125, 'Titulaire');
        doc.setFontSize(12);doc.setTextColor(0, 0, 0);
        var long=130
        if(typeof marche.Titulaire.Nom!="undefined")
        {
          doc.setFontType('bold');doc.text(20, 130, 'entreprise:');doc.setFontType('');doc.text(40, 130, marche.Titulaire.Nom)
          doc.setFontType('bold');doc.text(20, 135, 'Contact:');doc.setFontType('');doc.text(40, 135, marche.Titulaire.Contacte)
          doc.setFontType('bold');doc.text(20, 140, 'Email:');doc.setFontType('');doc.text(40, 140, marche.Titulaire.Mail)
          doc.setFontType('bold');doc.text(20, 145, 'Adresse:');doc.setFontType('');doc.text(40, 145, marche.Titulaire.Adresse_1+" "+marche.Titulaire.Adresse_2+" "+marche.Titulaire.Ville+"("+marche.Titulaire.CP+")")
          long=145
        }
        else
        doc.text(20, 130, 'Titulaire non renseigné');
        if(marche.SousTraitants.length>0){
        long=long+5
        doc.setFontSize(15);doc.setFontType('bold');doc.setTextColor(255, 0, 0);doc.text(20, long, 'Sous traitants');
        doc.setFontSize(12);doc.setTextColor(0, 0, 0);
        for(var i=0;i<marche.SousTraitants.length;i++){
          doc.setFontType('bold');doc.text(20, long+5, 'Sous traitant '+(i+1)+':')
          long+=5
          doc.setFontType('bold');doc.text(20, long+5, 'entreprise:');doc.setFontType('');doc.text(40, long+5, marche.SousTraitants[i].Nom)
          doc.setFontType('bold');doc.text(20, long+10, 'Contact:');doc.setFontType('');doc.text(40, long+10, marche.SousTraitants[i].Contacte)
          doc.setFontType('bold');doc.text(20, long+15, 'Email:');doc.setFontType('');doc.text(40, long+15, marche.SousTraitants[i].Mail)
          doc.setFontType('bold');doc.text(20, long+20, 'Adresse:');doc.setFontType('');doc.text(40, long+20, marche.SousTraitants[i].Adresse_1+" "+marche.SousTraitants[i].Adresse_2+" "+marche.SousTraitants[i].Ville+"("+marche.SousTraitants[i].CP+")")
          long+=20
        }
        }
        //la taille maximum en longeur es de 290 pour s'assurer qu'on dois faire un saut de page ou non on verifie que 290-long>=50 pour afficher les dates
        if(290-long<50)
        {doc.addPage(); long=15}
        doc.setFontSize(15);doc.setFontType('bold');doc.setTextColor(255, 0, 0);doc.text(20, long+10, 'Dates');
        doc.setFontSize(12);doc.setTextColor(0, 0, 0);
        doc.setFontType('bold');doc.text(20, long+15, 'Date de notification:');doc.setFontType('');doc.text(70, long+15, marche.DateNotific)
        doc.setFontType('bold');doc.text(20, long+20, 'Date de cloture:');doc.setFontType('');doc.text(70, long+20, marche.D_clot)
        doc.setFontType('bold');doc.text(20, long+25, 'Nombre de redirections:');doc.setFontType('');doc.text(70, long+25, marche.Nbr_reconduction+"")
        doc.setFontType('bold');doc.text(20, long+30, '	Durée initiale:');doc.setFontType('');doc.text(70, long+30, marche.D_init+"")
        doc.setFontType('bold');doc.text(20, long+35, '	Durée totale:');doc.setFontType('');doc.text(70, long+35, marche.D_tot+"")
        if(marche.Piece_Jointe.length>0)
        {doc.setFontType('bold');doc.text(20, long+40, 'Des pièces jointes liée a ce marché sont téléchargeable sur la plateforme AMP')}
        long+=40
        if(marche.historique.length>0)
        {
          doc.addPage();
          doc.setFontSize(15);doc.setFontType('bold');doc.setTextColor(255, 0, 0);doc.text(20, 20, 'Historique des modifications');
          doc.setFontSize(12);doc.setTextColor(0, 0, 0);
          long=25
          for(var i=0;i<marche.historique.length;i++)
          {
          long=(i==0)?long:long+20
          doc.setFontType('bold');doc.text(20, long+5, 'Modification:');doc.setFontType('');doc.text(70, long+5, marche.historique[i].numModif+1+"")
          doc.setFontType('bold');doc.text(20, long+10, 'Date:');doc.setFontType('');doc.text(70, long+10, marche.historique[i].date)
          doc.setFontType('bold');doc.text(20, long+15, 'Montant:');doc.setFontType('');doc.text(70,long+15, marche.historique[i].Montant+"")
          doc.setFontType('bold');doc.text(20,long+20, 'Prestation:');doc.setFontType('');doc.text(70,long+20, marche.historique[i].Prestation)}
        }
        doc.setFontType('bold');doc.setFontType('italic');doc.text(20, long+30, 'Document auto-généré par la plateforme AMP')
        // Save the PDF
        doc.save('Marche'+num_marche+'.pdf');
  }
}
