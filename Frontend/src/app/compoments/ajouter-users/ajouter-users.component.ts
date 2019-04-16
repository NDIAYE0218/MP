import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { UserService } from '../../user.service'
import swal from 'sweetalert2';
@Component({
  selector: 'app-ajouter-users',
  templateUrl: './ajouter-users.component.html',
  styleUrls: ['./ajouter-users.component.css']
})
export class AjouterUsersComponent implements OnInit {
  ajoutUser: FormGroup
  selected = "0"
  constructor(private fb: FormBuilder, private userservice: UserService) {
    this.ajoutUser = this.fb.group({
      Nom: ['', [Validators.minLength(2), Validators.required]],
      Prenom: ['', [Validators.minLength(2), Validators.required]],
      Poste: ['', [Validators.required, Validators.minLength(3)]],
      Email: ['', [Validators.required, Validators.email, Validators.minLength(20)]],
      Droit: ['', [Validators.required]]
    })
  }

  ngOnInit() {
  }
  AjouterUsers(Nom, Prenom, Poste, Email, Droit) {
    var mail_ok=(Email.substring(Email.length-15).toLowerCase()=="ville-clichy.fr")
    if (mail_ok) {
      var users = {
        Nom: Nom,
        Prenom: Prenom,
        Poste: Poste,
        Email: Email,
        Droit: (typeof Droit == "undefined") ? 0 : parseInt(Droit)
      }
      this.ajoutUser.reset()
      this.userservice.Ajouter_utilisateur(users).subscribe((data: any) => {
        if (data.etat == "existant")
          swal({ title: "Erreur", text: "l'utilisateur existe deja", type: "error" })
        else
          {
            this.userservice.Forget_password({Email:Email},0).subscribe((data:any)=> {console.log(data)})
            swal({ title: "Ajout réussis!", text: "l'utilisateur a recu un email lui permettant d'initialiser son compte", type: "success" })
          }
      })
    }
    else
    swal({ title: "Erreur", text: "Le domaine de l'email est incorrect; il dois être ville-clichy.fr", type: "error" })
  }
}
