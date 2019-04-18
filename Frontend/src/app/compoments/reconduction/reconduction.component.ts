import { Component, OnInit } from '@angular/core';
import {MarcheService} from '../../marche.service'
import {Router,ActivatedRoute} from '@angular/router'
import swal from 'sweetalert2';
@Component({
  selector: 'app-reconduction',
  templateUrl: './reconduction.component.html',
  styleUrls: ['./reconduction.component.css']
})
export class ReconductionComponent implements OnInit {

  constructor(private route:Router,private activroure:ActivatedRoute,private marcheservice:MarcheService) { }

  ngOnInit() {
    var _id= this.activroure.snapshot.paramMap.get('_id')
    var rep= parseInt(this.activroure.snapshot.paramMap.get('rep'))
    if(rep){
      this.marcheservice.reconductionExpresse(_id).subscribe((data:any)=>{
        if(data.etat=="notfind")
        swal({type:"error",text:"Ce marché n'existe pas"}).then(()=>{
          this.route.navigate(['marches'])
        })
        if(data.etat=="dead")
        swal({type:"error",text:"Ce lien n'est plus valide"}).then(()=>{
          this.route.navigate(['marches'])
        })
        if(data.etat=="ok")
        swal({type:"success",text:"votre reponse a bien été prise en compte, ce lien es desormais invalide"}).then(()=>{
          this.route.navigate(['marches'])})
      })
    }
    else
        swal({type:"warning",text:"nous considerons que vous ne reconduisez pas le marché, aucune action n'a été effectué sur celui-ci si vous changer d'avis vous pouvez toujours cliqué sur le oui recu par email"}).then(()=>{
          this.route.navigate(['marches'])
        })
  }

}
