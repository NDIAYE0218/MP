import { Component, OnInit } from '@angular/core';
import { Marches } from '../../Models/marche.model'
import { MarcheService } from '../../marche.service'
import {FormGroup,FormBuilder, Validators} from '@angular/forms'
import { Router } from '@angular/router'
import swal from 'sweetalert2';
@Component({
  selector: 'app-marches',
  templateUrl: './marches.component.html',
  styleUrls: ['./marches.component.css']
})
export class MarchesComponent implements OnInit {
  createForm: FormGroup;
  marches: Marches[];
  ColumnsInformation =['NumMarche','objet','nature','procedure','typeMarche','act']
  ColumnsMontant =['NumMarche','objet','typeMarche','montantmin','montantdeb','montantmax','act']
  ColumnsDirection =['NumMarche','objet','DG','serv','Contacte','act'];
  ColumnsDates =['NumMarche','objet','dte_not','dte_clo','duree','tot_recond','duree_total','act']
  ColumsTitulaire=['NumMarche','objet','Type','Nom','Nom_Contacte','Mail_Contacte','Adresse','act']
  ColumsFiles=['NumMarche','objet','fichiers','act']
  constructor(private marcheservice: MarcheService,private fb: FormBuilder, private router:Router) {
    this.createForm = this.fb.group({
      Annee_rech: ['',[Validators.nullValidator,Validators.maxLength(4),Validators.minLength(4)]],
      ID_rech: ['',[Validators.nullValidator,Validators.maxLength(6),Validators.minLength(6)]]
    })
   }

  ngOnInit() {
    this.fetchdata();
  }
  fetchdata(){
    this.marcheservice.getMarches().subscribe((data: Marches[])=>{
      this.marches=data;
    })
  }
  suppmarche(An,NumMarche){
    var numstr= (NumMarche.toString().length===1) ? An+"-00"+NumMarche : (NumMarche.toString().length===2) ? An+"-0"+NumMarche : An+"-"+NumMarche
    swal({
      title: "Êtes vous sûr?",
      text: "Vous êtes sur le point de supprimer le contrat "+numstr,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText:'Retour',
      confirmButtonText: 'Oui, supprimer'
    }).then((result) => {
      if (result.value) {
        this.marcheservice.deleteMarches(An,NumMarche).subscribe()
        swal(
          'Suppression reussis!',
          "le contrat "+numstr+" a bien été supprimé",
          'success'
        ).then(()=>{window.location.reload()})
      }
    })
  }
  reconduction_detail(Relance){
    var Message=""
    for(var i=0;i<Relance.length;i++){
      Message+="<div style=\"text-align: left\">"+(i+1)+":<br><t><b>Type:</b> "+Relance[i].type+ "<br><t><b>Date:</b> "+Relance[i].date+"<br><t> <b>Duré:</b>"+Relance[i].dure+" </div>"
    }
    if(Relance.length!=0)
    swal("Reconduction:",Message)
    else
    swal("a ce jour aucune reconduite n'a été effectué sur ce contrat")
  }
 
  rechercher(anne,numero){
    if(anne.length>0)
    {
      //recherche par année
      this.marcheservice.recherher(anne.substring(8)).subscribe((data: Marches[])=>{
        if(data!=null && data.length!=0)
        this.marches=data;
        else
        swal('Introuvable','Aucun marché ne correspond a votre recherche','warning')
      })
    }
    else{
      this.router.navigate(['/marches/'+numero]);
    }
  }
  disp_annee(annee){
    //verifie l'existance d'une 
    return (typeof annee[0] != 'undefined')
  }
}
