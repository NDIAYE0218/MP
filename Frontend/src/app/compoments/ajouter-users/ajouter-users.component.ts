import { Component, OnInit } from '@angular/core';
import {FormGroup,FormBuilder, Validators} from '@angular/forms'
@Component({
  selector: 'app-ajouter-users',
  templateUrl: './ajouter-users.component.html',
  styleUrls: ['./ajouter-users.component.css']
})
export class AjouterUsersComponent implements OnInit {
  ajoutUser:FormGroup
  constructor(private fb :FormBuilder) {
    this.ajoutUser= fb.group({
      Nom: ['', [Validators.minLength(2),Validators.required]],
      Prenom: ['', [Validators.minLength(2),Validators.required]],
      Poste: ['',[Validators.required,Validators.minLength(3)]],
      Email: ['',[Validators.required,Validators.email,Validators.minLength(20)]],
      Droit: ['', [Validators.required]]
    })
   }

  ngOnInit() {
  }
  AjouterUsers(Nom,Prenom,Poste,Email,Droit){
    var users={
      Nom:Nom,
      Prenom:Prenom,
      Poste:Poste,
      Email:Email,
      Droit:Droit
    }
    console.log(users)
  }
}
