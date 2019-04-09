import { Component, OnInit } from '@angular/core';
import {MarcheService} from '../../marche.service'
import {Marches} from '../../Models/marche.model'
import {Router, ActivatedRoute} from '@angular/router'
import swal from 'sweetalert2';
@Component({
  selector: 'app-marche',
  templateUrl: './marche.component.html',
  styleUrls: ['./marche.component.css']
})
export class MarcheComponent implements OnInit {

  marche : Marches[]=[]
  display:boolean=false
  reconduction: boolean=false
  disp_annee: boolean=false
  constructor(private marcheservice: MarcheService, private router: Router,private params:ActivatedRoute) { }

  ngOnInit() {
    var numero= this.params.snapshot.paramMap.get('id')
    if(numero.includes('-'))
    {
      var id= numero.split('-')
      var NumMarche = id[1]
      var An=id[0]
      this.fetchMarche(NumMarche,An)
  }
  else
      swal('URL Invalide','ce lien es invalide','warning').then(()=>{this.router.navigate(['/marches'])})
  
  }

  fetchMarche(NumMarche,An){
      this.marcheservice.getMarche(NumMarche, An).subscribe((data: Marches[])=>{
      if(data!=null&&Object.keys(data).length>1)
      {
        this.marche=data;
        this.display=true
        this.reconduction= data.hasOwnProperty('Format_process')
        this.disp_annee=(Object.keys(data['Annee']).length>0)
      }
      else
      swal('Introuvable','Aucun marché ne correspond a ce numero','warning').then(()=>{this.router.navigate(['/marches'])})
      })  
  }

}
