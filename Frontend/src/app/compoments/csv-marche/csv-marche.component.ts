import { Component,OnInit} from '@angular/core';
import { Subscription } from 'rxjs'
import { Router } from '@angular/router'
import {UserService} from '../../user.service'
import {
  HttpClient, HttpRequest,
  HttpResponse, HttpEvent
} from '@angular/common/http'
import swal from 'sweetalert2';
@Component({
  selector: 'app-csv-marche',
  templateUrl: './csv-marche.component.html',
  styleUrls: ['./csv-marche.component.css']
})
export class CsvMarcheComponent  {
  accept = '*'
  files:File[] = []
  progress:number
  url = 'http://amp.mairie-clichy.fr:4000/Marche/upload'
  hasBaseDropZoneOver:boolean = false
  httpEmitter:Subscription
  httpEvent:HttpEvent<{}>
  lastFileAt:Date
  sendableFormData:FormData
  validateur=false
  constructor(public HttpClient:HttpClient,private router: Router,private userservice:UserService){}
  cancel(){
    this.progress = 0
    if( this.httpEmitter ){
      console.log('cancelled')
      this.httpEmitter.unsubscribe()
    }
  }
  ngOnInit(){
    if(!this.userservice.Access())
      this.router.navigate(['marches'])
    else
    this.validateur=true
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

