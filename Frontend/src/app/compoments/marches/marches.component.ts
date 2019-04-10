import { Component, OnInit } from '@angular/core';
import { Marches } from '../../Models/marche.model'
import { MarcheService } from '../../marche.service'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import swal from 'sweetalert2';
import { htmlAstToRender3Ast } from '@angular/compiler/src/render3/r3_template_transform';
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
  constructor(private marcheservice: MarcheService, private fb: FormBuilder, private router: Router) {
    this.createForm = this.fb.group({
      Annee_rech: ['', [Validators.nullValidator, Validators.maxLength(4), Validators.minLength(4)]],
      ID_rech: ['', [Validators.nullValidator, Validators.maxLength(6), Validators.minLength(6)]]
    })
  }

  ngOnInit() {
    this.fetchdata();
  }
  fetchdata() {
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
      title: "Modifier le marché",
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
         //modif du webservice
         this.marcheservice.updateMarches(marche,marche._id)
         this.fetchdata()
        }
      }
    })
  }
}
