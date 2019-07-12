import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { MarcheService } from '../../marche.service'
import swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import {
  HttpClient, HttpRequest,
  HttpResponse, HttpEvent
} from '@angular/common/http'
import { Observable, Subscription, from } from 'rxjs';
@Component({
  selector: 'app-marche',
  templateUrl: './marche.component.html',
  styleUrls: ['./marche.component.css']
})
export class MarcheComponent implements OnInit {
  createForm: FormGroup
  act="Ajouter"
  forme_ajout=1
  marche={Objet:"" ,NomTitulaire:"" ,Tel:"" ,CP:"" ,Adresse :"",Mail:"" ,Montant:0 ,DateNotification:"" ,Observation:"",Duree:0,TypeReconduction:"" }
  accept = '*'
  files:File[] = []
  progress:number
  url = 'http://amp.mairie-clichy.fr:4000/Informatique/Marches/upload'
  // url = 'http://localhost:4000/Informatique/Marches/upload';
  hasBaseDropZoneOver:boolean = false
  httpEmitter:Subscription
  httpEvent:HttpEvent<{}>
  lastFileAt:Date
  sendableFormData:FormData
  validateur=false
  constructor(private marcheservice: MarcheService,private router: Router, private params: ActivatedRoute, private fb: FormBuilder,public HttpClient:HttpClient) {
    this.createForm = this.fb.group({
      Objet: ['', Validators.required],
      Reconduction: ['', Validators.required],
      NomTitulaire:['', Validators.required],
      CP: ['', Validators.nullValidator],
      Adresse: ['',Validators.nullValidator],
      Mail:['',Validators.email],
      Tel: ['',Validators.nullValidator],
      Montant: ['', Validators.required],
      DateNotification:['', Validators.required],
      Duree:['', Validators.required],
      Observation:['', Validators.nullValidator]
    })
   }
  ngOnInit() {
    var option = this.params.snapshot.paramMap.get('option')
    if(option=="Ajouter")
    this.act="Ajouter"
    else if(option=="upload"){
      this.forme_ajout=0
    }
    else
    {
      this.act="Modifier"
      var recherche={_id:this.params.snapshot.paramMap.get('option')}
      this.marcheservice.getMarches(recherche).subscribe((data:any)=>{
        if(data=='ko')
        swal({type:"error",text:"URL invalide"})
        else
        this.marche=data[0]
      })
  }
  }
  action(Objet ,NomTitulaire ,Tel ,CP ,Adresse ,Mail ,Montant ,DateNotification ,Observation,Duree,TypeReconduction ){
    console.log(Objet)
    var marche={Objet ,NomTitulaire ,Tel ,CP ,Adresse ,Mail ,Montant ,DateNotification ,Observation,Duree,TypeReconduction }
    if(this.act=="Ajouter")
    this.marcheservice.CreerMarcher(marche).subscribe((data:any)=>{swal({type:"success",text:"Ajout réussis!"})})
    else{
      var _id= this.params.snapshot.paramMap.get('option')
      marche['_id']=_id
      if(marche.DateNotification=='')
      marche.DateNotification=this.marche.DateNotification
      this.marcheservice.updateMarches(marche).subscribe((data:any)=>{swal({type:"success",text:"Modification réussis!"})})
    }
    this.router.navigate(['/marches'])
  }
  cancel(){
    this.progress = 0
    if( this.httpEmitter ){
      console.log('cancelled')
      this.httpEmitter.unsubscribe()
    }
  }
  uploadFiles(files:File[]):Subscription{
    const req = new HttpRequest<FormData>('POST', this.url, this.sendableFormData, {
      reportProgress: true//, responseType: 'text'
      
    })
    
    return this.httpEmitter = this.HttpClient.request(req)
    .subscribe(
      event=>{
        this.httpEvent = event
        if (event instanceof HttpResponse) {
          delete this.httpEmitter
          var ret=event.body;
          ret= JSON.stringify(ret);
          swal({
            title: (ret as string).substring(11,(ret as string).length-2),
            text: " ",
            type: 'success',
            showCancelButton: true,
            cancelButtonColor: 'rgba(24, 56, 170, 0.781)',
            cancelButtonText:'Retour',
            confirmButtonText: 'Liste des marché'
          }).then((result) => {
            this.router.navigate(['/marches'])
          })
          
        }
      },
      error=>console.log('Error Uploading',error)
    )
  }
  getDate(){
    return new Date()
  }
}