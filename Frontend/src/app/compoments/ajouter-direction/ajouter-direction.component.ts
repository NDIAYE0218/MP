import { Component, OnInit } from '@angular/core';
import {FormGroup,FormBuilder, Validators} from '@angular/forms'
import {Router} from '@angular/router'
import {DirectionService} from '../../direction.service'
import {UserService} from '../../user.service'
import swal from 'sweetalert2';
@Component({
  selector: 'app-ajouter-direction',
  templateUrl: './ajouter-direction.component.html',
  styleUrls: ['./ajouter-direction.component.css']
})
export class AjouterDirectionComponent implements OnInit {

  createForm: FormGroup;
  serviceForm: FormGroup;
  droit=-1
  constructor(private directionService: DirectionService, private fb: FormBuilder, private router: Router,private userservice:UserService) {
    this.createForm = this.fb.group({
      Nom: ['',Validators.required]
    })

    this.serviceForm = this.fb.group({
      NumServ: ['',Validators.required],
      NomDG:  ['',Validators.required],
      Nom: ['',Validators.required]
    })
   }
  ajouterDirection(Nom){
    this.directionService.creeDirections(Nom).subscribe()
    swal('la direction '+Nom+' a bien été ajouté')
    this.router.navigate(['/marche/ajouter'])
  }
  ajouterService(NomDG,Nom){
    this.directionService.creeservice(NomDG,Nom).subscribe()
    swal('Service bien ajouté')

  }

  ngOnInit() {
    if(this.userservice.Access())
    {
      this.droit=this.userservice.InfoUser().Droit
    }
    else
    {
      this.router.navigate(['marches'])
    }
  }

}
