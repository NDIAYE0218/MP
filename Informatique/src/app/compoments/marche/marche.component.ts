import { Component, OnInit } from '@angular/core';
import { MarcheService } from '../../marche.service'
import { Marches } from '../../Models/marche.model'
import { Router, ActivatedRoute } from '@angular/router'
import swal from 'sweetalert2';
import * as jsPDF from 'jspdf'
import { UserService } from '../../user.service'
@Component({
  selector: 'app-marche',
  templateUrl: './marche.component.html',
  styleUrls: ['./marche.component.css']
})
export class MarcheComponent implements OnInit {

  marche: Marches[] = []
  display: boolean = false
  reconduction: boolean = false
  disp_annee: boolean = false
  histo = true
  tranche_op = true
  droit = -1
  constructor(private marcheservice: MarcheService, private router: Router, private params: ActivatedRoute, private userservice: UserService) { }

  ngOnInit() {
    var numero = this.params.snapshot.paramMap.get('id')
    if (this.userservice.Access())
      this.droit = this.userservice.InfoUser().Droit
    if (numero.includes('-')) {
      var id = numero.split('-')
      var NumMarche = id[1]
      var An = id[0]
      this.fetchMarche(NumMarche, An)
    }
    else
      swal('URL Invalide', 'ce lien es invalide', 'warning').then(() => { this.router.navigate(['/marches']) })

  }

  fetchMarche(NumMarche, An) {
    this.marcheservice.getMarche(NumMarche, An).subscribe((data: Marches[]) => {
      if (data != null && Object.keys(data).length > 1) {
        this.marche = data;
        this.display = true
        this.reconduction = data.hasOwnProperty('Format_process')
        this.disp_annee = (Object.keys(data['Annee']).length > 0)
      }
      else
        swal('Introuvable', 'Aucun marché ne correspond a ce numero', 'warning').then(() => { this.router.navigate(['/marches']) })
    })
  }
  histo_vue(option = 1) {
    if (option)
      this.histo = !this.histo;
    else
      this.tranche_op = !this.tranche_op
  }
  add_sous_traitant(titul,element) {
    var montant_attribue = 0
    for (var i = 0; i < titul.SousTraitants.length; i++)
      montant_attribue += titul.SousTraitants[i].Montant
    var montant = titul.Montant - montant_attribue
    var html= '<div style="display: inline-block;width: 200px;"><label>Nom société: </label><input type="text"  required id="NomTit_0"><br></div>' +
    '<div style="display: inline-block;width: 200px;"><label>Nom contact:</label><input type="text" required id="Nom_0"><br></div>'+
    '<div style="display: inline-block;width: 200px;"><label>Adresse:</label><input type="text" required id="Adresse_0"><br></div>'+
    '<div style="display: inline-block;width: 200px;"><label>Email:</label><input type="email" required id="Mail_0"><br></div>'+
    '<div style="display: inline-block;width: 200px;"><label>Téléphone:</label><input type="tel" pattern="[0-9]{2} [0-9]{2} [0-9]{2} [0-9]{2} [0-9]{2}" required id="telephone_0"><br></div>'+
    '<div style="display: inline-block;width: 200px;"><label>Montant:</label><input type="number" required id="Montant_0"><br></div>'
    swal({
      title: "Nouveau sous-traitant",
      html: html,
      width:"30%",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#E89013',
      confirmButtonText: 'Ajouter',
      cancelButtonText: 'Retour'
    }).then((result) => {
      var NomTit_0 = (document.getElementById("NomTit_0") as HTMLTextAreaElement).value
      var Adresse_0 = (document.getElementById("Adresse_0") as HTMLTextAreaElement).value
      var Mail_0 = (document.getElementById("Mail_0") as HTMLTextAreaElement).value
      var Montant_0 = (document.getElementById("Montant_0") as HTMLTextAreaElement).value
      var nom = (document.getElementById("Nom_0") as HTMLTextAreaElement).value
      var tel = (document.getElementById("telephone_0") as HTMLTextAreaElement).value
      if (montant - parseInt(Montant_0) >= 0) { titul.SousTraitants.push({ Nom: NomTit_0, Adresse: Adresse_0, Mail: Mail_0+"$$"+nom+"$$"+tel, Montant: parseInt(Montant_0) });}
    else
      swal({ text: "le montant attribuer a ce sous-traitant dois être inferieur ou égal à " + (montant), type: "warning" })
      this.marche['agent_enregist']= "Modifié le "+this.genedate()+" par "+this.userservice.InfoUser().Nom+" "+this.userservice.InfoUser().Prenom
      this.marcheservice.updateMarches(this.marche,this.marche["_id"])
    })
  }
  liste_sous_traitant(titul){
    var html="<html><head><style>table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}td, th {border: 1px solid #dddddd;text-align: left;padding: 8px;}tr:nth-child(even) {background-color: #dddddd;}</style></head><body><table><tr><th>Nom société</th><th>Nom contact</th><th>Email de contacte</th><th>Téléphone</th><th>Adresse</th><th>Montant mis à disposition</th></tr>"
    for(var i=0;i<titul.SousTraitants.length;i++)
    html+='<tr><td>'+titul.SousTraitants[i].Nom+'</td><td>'+titul.SousTraitants[i].Mail.split('$$')[1]+'</td><td>'+titul.SousTraitants[i].Mail.split('$$')[0]+'</td><td>'+titul.SousTraitants[i].Mail.split('$$')[2]+'</td><td>'+titul.SousTraitants[i].Adresse+'</td><td>'+titul.SousTraitants[i].Montant+'€(HT)</td></tr>'
    html+="</table></body></html>"
    swal({
      title: "Liste sous-traitant de "+titul.Nom,
      html: html,
      width:'50%'
    })
  }
  Telecharger(marche) {
    //definition numero du marche
    //information generale
    var num_marche = (marche.NumMarche.toString().length == 1) ? marche.An + "-00" + marche.NumMarche : (marche.NumMarche.toString().length == 2) ? marche.An + "-0" + marche.NumMarche : marche.An + "-" + marche.NumMarche + ""
    var doc = new jsPDF();
    doc.setFontSize(30); doc.setTextColor(0, 0, 255); doc.text(70, 20, 'Marché n°' + num_marche);
    doc.setFontSize(15); doc.setFontType('bold'); doc.setTextColor(255, 0, 0); doc.text(20, 40, 'Information Générales ');
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
     
     doc.text(30, 50, 'Objet:  '); doc.setFontType(''); 
     //gestion du overflow de l'objet; overflot arrive a 80
     var tour=Math.trunc(marche.objet.length/75)+1
     var long=45
     for(var i=0;i<tour;i++)
     {doc.text(78, long+5, marche.objet.substring(i*75,(i+1)*75));long+=5}
    doc.setFontType('bold'); doc.text(30, long+5, 'Nature:'); doc.setFontType(''); doc.text(78, long+5, marche.Nature)
    doc.setFontType('bold'); doc.text(30, long+10, 'Type Procédure:'); doc.setFontType(''); doc.text(78, long+10, marche.Type_process)
    doc.setFontType('bold'); doc.text(30, long+15, 'Forme et type de marché:'); doc.setFontType(''); doc.text(78, long+15, marche.Format_process + "/" + marche.Type_Marche)
    //Dates
    doc.setFontSize(15); doc.setFontType('bold'); doc.setTextColor(255, 0, 0); doc.text(20, long+25, 'Information Dates');
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
    doc.setFontType('bold'); doc.text(30, long+35, 'Date d\'alerte:'); doc.setFontType(''); doc.text(78, long+35, this.getDate(marche.DateNotific))
    doc.setFontType('bold'); doc.text(30, long+40, 'Date de notification:'); doc.setFontType(''); doc.text(78, long+40, this.getDate(marche.Date_debut))
    doc.setFontType('bold'); doc.text(30, long+45, 'Date de création:'); doc.setFontType(''); doc.text(78, long+45, marche.Datecreation)
    doc.setFontType('bold'); doc.text(30, long+50, 'Date de cloture:'); doc.setFontType(''); doc.text(78, long+50, this.getDate(marche.D_clot))
    doc.setFontType('bold'); doc.text(30, long+55, 'Nombre de redirections:'); doc.setFontType(''); doc.text(78, long+55, marche.Nbr_reconduction +"")
    doc.setFontType('bold'); doc.text(30, long+60, 'Durée initiale:'); doc.setFontType(''); doc.text(78, long+60, marche.D_init +"")
    doc.setFontType('bold'); doc.text(30, long+65, 'Durée totale:'); doc.setFontType(''); doc.text(78, long+65, marche.D_tot +"")
    long+=65
    if (290 - long < 30) { doc.addPage(); long = 15 }
    //directions
    doc.setFontSize(15); doc.setFontType('bold'); doc.setTextColor(255, 0, 0); doc.text(20, long+10, 'Information Directions');
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
    doc.setFontType('bold'); doc.text(30, long+20, 'Direction:'); doc.setFontType(''); doc.text(78, long+20, marche.DG)
    doc.setFontType('bold'); doc.text(30, long+25, 'Service:'); doc.setFontType(''); doc.text(78, long+25, (typeof marche.serv == "undefined") ? "" : marche.serv)
    doc.setFontType('bold'); doc.text(30, long+30, 'Contact:'); doc.setFontType(''); doc.text(78, long+30, marche.Contacte)
    long+=30
    if (290 - long < 40) { doc.addPage(); long = 15 }
    //montants
    doc.setFontSize(15); doc.setFontType('bold'); doc.setTextColor(255, 0, 0); doc.text(20, long+10, 'Information Montants')
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
    doc.setFontType('bold'); doc.text(30, long+20, 'Seuil Mini:'); doc.setFontType(''); doc.text(78, long+20, marche.Montant_Min_HT_ini + " (HT)€ / " + marche.Montant_Min_TTC_ini + " (TTC)€")
    doc.setFontType('bold'); doc.text(30, long+25, 'Seuil Maxi:'); doc.setFontType(''); doc.text(78, long+25, marche.Montant_Max_HT_ini + " (HT)€ / " + marche.Montant_Max_TTC_ini + " (TTC)€")
    doc.setFontType('bold'); doc.text(30, long+30, 'Seuil global:'); doc.setFontType(''); doc.text(78, long+30, "min: " + marche.Montant_Min_HT_glob + "€ - max:" + marche.Montant_Max_HT_glob + "€  ")
    doc.setFontType('bold'); doc.text(30, long+35, 'Montant consomé:'); doc.setFontType(''); doc.text(78, long+35, this.calcul_solde(marche)+ " (TTC)€")
    if(marche.Montant_Max_HT_glob==0)
    {doc.setFontType('bold'); doc.text(30, long+40, 'Solde:'); doc.setFontType(''); doc.text(78, long+40,  "Pas de maximum")}
    else
    {doc.setFontType('bold'); doc.text(30, long+40, 'Solde:'); doc.setFontType(''); doc.text(78, long+40,(marche.Montant_Max_HT_glob - this.calcul_solde(marche))+  " (TTC)€")}
    long+=40
    if (290 - long < 10) { doc.addPage(); long = 15 }
    //titulaire
    doc.setFontSize(15); doc.setFontType('bold'); doc.setTextColor(255, 0, 0); doc.text(20, long+10, 'Information Titulaires');
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
    long+=10
    for (var i = 0; i < marche.Titulaire.length; i++) {
      if (290 - long < 40) { doc.addPage(); long = 15 }
      if(i==0){
        doc.setFontType('bold'); doc.text(30, long + 10, 'Titulaire:'); doc.setFontType(''); doc.text(78, long + 10, marche.Titulaire[i].Nom)
      }
      else{
        doc.setFontType('bold'); doc.text(30, long + 10, '(co)Titulaire(s) '+i+':'); doc.setFontType(''); doc.text(78, long + 10, marche.Titulaire[i].Nom)
      }
      doc.setFontType('bold'); doc.text(30, long + 15, 'Nom contact:'); doc.setFontType(''); doc.text(78, long + 15, marche.Titulaire[i].Mail.split('$$')[1]) 
      doc.setFontType('bold'); doc.text(30, long + 20, 'Email:'); doc.setFontType(''); doc.text(78, long + 20, marche.Titulaire[i].Mail.split('$$')[0])
      doc.setFontType('bold'); doc.text(30, long + 25, 'Téléphone:'); doc.setFontType(''); doc.text(78, long + 25, marche.Titulaire[i].Mail.split('$$')[2])
      doc.setFontType('bold'); doc.text(30, long + 30, 'Adresse:'); doc.setFontType(''); doc.text(78, long + 30, marche.Titulaire[i].Adresse)
      doc.setFontType('bold'); doc.text(30, long + 35, 'Budget alloué:'); doc.setFontType(''); doc.text(78, long + 35, marche.Titulaire[i].Montant + ' (HT)€')
      var t_r=40
      if (marche.Titulaire[i].SousTraitants.length > 0)
       { doc.setFontType('bold'); doc.text(30, long + 40, 'Détail sous-traitant(s):'); t_r+=5 
       doc.setDrawColor(255, 0, 0);doc.rect(28, long+5, 180, t_r+(30*marche.Titulaire[i].SousTraitants.length));doc.setDrawColor(0, 0, 0);
             }
       else{doc.setDrawColor(255, 0, 0);doc.rect(28, long+5, 180, t_r);doc.setDrawColor(0, 0, 0);}
      long += 40
      for (var j = 0; j < marche.Titulaire[i].SousTraitants.length; j++) {
        if (290 - long < 35) { doc.addPage(); long = 15 }
        doc.setFontType('bold'); doc.text(40, long + 10, 'Sous-traitant ' + (j + 1) + ':'); doc.setFontType(''); doc.text(88, long + 10, marche.Titulaire[i].SousTraitants[j].Nom)
        doc.setFontType('bold'); doc.text(40, long + 15, 'Nom Contact:'); doc.setFontType(''); doc.text(88, long + 15, marche.Titulaire[i].SousTraitants[j].Mail.split('$$')[1])
        doc.setFontType('bold'); doc.text(40, long + 20, 'Email:'); doc.setFontType(''); doc.text(88, long + 20, marche.Titulaire[i].SousTraitants[j].Mail.split('$$')[0])
        doc.setFontType('bold'); doc.text(40, long + 25, 'Téléphone:'); doc.setFontType(''); doc.text(88, long + 25, marche.Titulaire[i].SousTraitants[j].Mail.split('$$')[2])
        doc.setFontType('bold'); doc.text(40, long + 30, 'Adresse:'); doc.setFontType(''); doc.text(88, long + 30, marche.Titulaire[i].SousTraitants[j].Adresse)
        doc.setFontType('bold'); doc.text(40, long + 35, 'Budget alloué:'); doc.setFontType(''); doc.text(88, long + 35, marche.Titulaire[i].SousTraitants[j].Montant + '€') //montant alloué
        //mm systeme que les titulaires
        doc.rect(38, long+5, 100, 32)
        long += 35
      }
    }
    //Tranche optionnel
    if (290 - long < 30) { doc.addPage(); long = 15 }
    for (var i = 0; i < marche.Tranche_optionnel.length; i++) {
      if (290 - long < 50) { doc.addPage(); long = 15 }
      doc.setFontSize(15); doc.setFontType('bold'); doc.setTextColor(255, 0, 0); doc.text(20, long + 15, 'Tranches optionnel ' + (i + 1)+':');
      doc.setFontSize(12); doc.setTextColor(0, 0, 0);
      doc.setFontType('bold'); doc.text(30, long + 25, 'Condition:'); doc.setFontType(''); doc.text(78, long + 25, marche.Tranche_optionnel[i].condition)
      doc.setFontType('bold'); doc.text(30, long + 30, 'Budget:'); doc.setFontType(''); doc.text(78, long + 30, marche.Tranche_optionnel[i].Montant + " (HT)€")
      //getion oveerflow de l'observation
      var tr=Math.trunc(marche.Tranche_optionnel[i].Observation.length/60)+1
      if (290 - long < tr*5) { doc.addPage(); long = 15 } 
      doc.setFontType('bold'); doc.text(30, long+35, 'Observation:'); doc.setFontType('');
      doc.rect(28, long+20, 170, (tr*5)+12)
      long += 30
      for(var j=0;j<tr;j++){
        doc.text(78, long+5, marche.Tranche_optionnel[i].Observation.substring(j*60,(j+1)*60));long+=5
      }
      
    }
    //Avenants
    for (var i = 0; i < marche.historique.length; i++) {
      var resum=marche.historique[i].Resume
      var tr2=Math.trunc(resum.length/70)+1
      if (290 - long < 35+(tr2*5)) { doc.addPage(); long = 15 }
      doc.setFontSize(15); doc.setFontType('bold'); doc.setTextColor(255, 0, 0); doc.text(20, long + 10, 'Avenant ' + (i + 1)+':');
      doc.setFontSize(12); doc.setTextColor(0, 0, 0);
      doc.setFontType('bold'); doc.text(30, long + 20, 'Objet:'); doc.setFontType(''); doc.text(78, long + 20, marche.historique[i].Objet)
      doc.setFontType('bold'); doc.text(30, long + 25, 'Montant:'); doc.setFontType(''); doc.text(78, long + 25, marche.historique[i].Montant+' (HT)€')
      doc.setFontType('bold'); doc.text(30, long + 30, 'Mois:'); doc.setFontType(''); doc.text(78, long + 30, marche.historique[i].Mois+' mois')
      //getsion overflow observation
      doc.setFontType('bold'); doc.text(30, long + 35, 'Resumé:');doc.setFontType('');
      long+=35
      for(var j=0;j<tr2;j++){doc.text(78, long+(5*j), resum.substring(j*70,(j+1)*70));long+=5}
    }
    if (290 - long < 30) { doc.addPage(); long = 15 }
    if (marche.Piece_Jointe.length > 0) { doc.setFontType('bold'); doc.text(20, long +10, 'Des pièces jointes liée a ce marché sont téléchargeable sur la plateforme AMP') }
    doc.setFontType('bold');doc.text(20, long + 20, marche.agent_enregist )
    doc.setFontType('bold'); doc.setFontType('italic'); doc.text(20, long + 30, 'Document auto-généré par la plateforme AMP')
    // Save the PDF
    doc.save('Marche' + num_marche + '.pdf');
  }
  update_co_traitant(titul) {
    var montan_att = 0
    for (var i = 0; i < this.marche['Titulaire'].length; i++)
      montan_att += this.marche['Titulaire'][i].Montant
    var montant_dispo = parseInt(this.marche['Montant_Max_HT_glob']) - montan_att + titul.Montant
    swal({
      title: 'Modifier le montant attribué a ' + titul.Nom,
      input: 'text',
      showCancelButton: true,
      cancelButtonText: 'Retour',
      confirmButtonText: 'Valider',
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        if (parseInt(this.marche['Montant_Max_HT_glob']) != 0) {
          if (montant_dispo - parseInt(result.value) >= 0) {
            titul.Montant = result.value
            this.marche['agent_enregist']= "Modifié le "+this.genedate()+" par "+this.userservice.InfoUser().Nom+" "+this.userservice.InfoUser().Prenom
            this.marcheservice.updateMarches(this.marche, this.marche['_id'])
          }
          else
            swal({ text: "le montant dois être inferieur ou égal a " + montant_dispo, type: "warning" })
        }
        else {
          titul.Montant = result.value
          this.marche['agent_enregist']= "Modifié le "+this.genedate()+" par "+this.userservice.InfoUser().Nom+" "+this.userservice.InfoUser().Prenom
          this.marcheservice.updateMarches(this.marche, this.marche['_id'])
        }
      }
    })
  }
  calcul_solde(element){
    var cons=0;
    for(var i=0;i<element.Titulaire.length;i++){
      cons+=element.Titulaire[i].Montant
    }
    return cons
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
  genedate() {
    var event = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return (event.toLocaleDateString('fr-FR', options));
  }
}
