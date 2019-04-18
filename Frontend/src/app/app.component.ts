import { Component,OnInit } from '@angular/core';
import {UserService} from './user.service'
import {Router} from '@angular/router'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Frontend';
  droit=-1
  constructor(private userservice:UserService,private route:Router){}
  ngOnInit(){
    if(this.userservice.Access())
      this.droit=this.userservice.InfoUser().Droit
  }
  Deconnexion(){
    if(this.droit==-1)
    this.route.navigate(['Connexion'])
    else
    {this.userservice.Deconnexion();
    document.location.reload(true);}
  }
}
