import { Component, OnInit } from '@angular/core';
import {FormGroup,FormBuilder, Validators} from '@angular/forms'
import {Router} from '@angular/router'
import {DirectionService} from '../../direction.service'
import swal from 'sweetalert2';
@Component({
  selector: 'app-ajouter-direction',
  templateUrl: './ajouter-direction.component.html',
  styleUrls: ['./ajouter-direction.component.css']
})
export class AjouterDirectionComponent implements OnInit {

  createForm: FormGroup;
  serviceForm: FormGroup;

  constructor(private directionService: DirectionService, private fb: FormBuilder, private router: Router) {
    this.createForm = this.fb.group({
      NumDG: ['',Validators.required],
      Nom: ['',Validators.required]
    })

    this.serviceForm = this.fb.group({
      NumServ: ['',Validators.required],
      NomDG:  ['',Validators.required],
      Nom: ['',Validators.required]
    })
   }
  ajouterDirection(NumDG,Nom){
    this.directionService.creeDirections(NumDG,Nom).subscribe()
    swal('la direction '+Nom+' a bien été ajouté')
    this.router.navigate(['/marche/ajouter'])
  }
  ajouterService(NumServ,NomDG,Nom){
    this.directionService.creeservice(NumServ,NomDG,Nom).subscribe()
    swal('Service bien ajouté')

  }

  ngOnInit() {
  }

}
