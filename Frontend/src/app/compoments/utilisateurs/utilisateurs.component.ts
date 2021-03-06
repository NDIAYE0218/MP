import { Component, OnInit } from '@angular/core';
import {UserService} from '../../user.service'
import swal from 'sweetalert2';
import { Router } from '@angular/router'
@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css']
})
export class UtilisateursComponent implements OnInit {
  Columnsusers = ['Email', 'Nom', 'Prenom', 'Poste','Droits', 'act']
  users:any
  constructor(private userservice:UserService,private route:Router) { }
  ngOnInit() {
    if(this.userservice.Access()){
      if(this.userservice.InfoUser().Droit<3)
        this.route.navigate(['marches'])
      else
      this.findUsers()
    }
    else
    this.route.navigate(['marches'])
  }
  findUsers(){
    this.userservice.GetAll().subscribe((data:any)=>{
      this.users=data
    })
  }
  Delete(_id){
    this.userservice.Delete(_id).subscribe((data:any)=>{
      if(data.etat="ok"){
        this.findUsers()
      }
      else
      swal({type:"error",title:"oops",text:"une erreur es survenu l'ors de la suppression"})
    })
  }
  affichedroit(Droit){
    var text=(Droit==0)?"Ajouter marché":(Droit==1)?"Ajouter et modifier marché":(Droit==2)?"Ajouter, modifier et supprimer marché":"Ajouter, modifier, supprimer marché et utilisateur"
    return text;
  }
}
