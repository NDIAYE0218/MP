import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import {UserService} from '../../user.service'
import swal from 'sweetalert2';
import {Router} from '@angular/router'
@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent implements OnInit {
  connForm:FormGroup
  constructor(private fb:FormBuilder, private userservice:UserService,private route:Router) {
    this.connForm=this.fb.group({
      Login:['',[Validators.email,Validators.required,Validators.minLength(20)]],
      MDP: ['',[Validators.required,Validators.minLength(8)]]
    })
   }
  ngOnInit() {
    if(this.userservice.Access())
    this.route.navigate(['marches'])
  }
  connexion(Login,MDP){
    var recherche={
      Email:Login.toLowerCase(),
      MDP:MDP
    }
    this.userservice.Connexion(recherche).subscribe((data:any)=>{
      if(data==null)
      swal({type:"error",title:"Login ou mot de passe incorrecte"})
      else
      {
        this.userservice.CreateCookie(data)
        document.location.reload(true);
      }
    })
  }
  forget(){
    swal({
      input: 'text',
      title: 'Mot de passe oublié',
      inputAttributes: {
      autocapitalize: 'off'
    },
    text:"Votre email",
    showCancelButton: true,
    confirmButtonText: 'Reinitialiser',
    cancelButtonText:"Retour",
    showLoaderOnConfirm: true,
  }).then((result) => {
    var Email=result.value
      this.userservice.Forget_password({Email:Email.toLowerCase()},1).subscribe((data:any)=>{
        if(data.etat=="inconnue")
        swal({text:"cet email n'appartient pas a notre domaine"})
        else
        swal({text:"Vous avez recu un email vous permettant de reinitialiser votre mot de passe",type:"success"})
      })
  })
  }
}
