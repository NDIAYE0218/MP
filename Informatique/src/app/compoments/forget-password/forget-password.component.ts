import { Component, OnInit } from '@angular/core';
import {UserService} from '../../user.service'
import {FormGroup,FormBuilder, Validators} from '@angular/forms'
import {Router,ActivatedRoute} from '@angular/router'
import swal from 'sweetalert2';
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  forgetForm:FormGroup
  constructor(private usersservice:UserService, private fb: FormBuilder,private params:ActivatedRoute, private router: Router) {
    this.forgetForm=this.fb.group({
      Email:['',[Validators.email,Validators.required,Validators.minLength(20)]],
      Password:['',[Validators.minLength(8),Validators.required]],
      PasswordConf:['',[Validators.minLength(8),Validators.required]]
    })
   }

  ngOnInit() {
  }
  Modifier(Email, Password,PasswordConf){
    var crypto= this.params.snapshot.paramMap.get('crypto')
    if(Password!=PasswordConf)
    swal({title: "Non conformité des mot de passe", type:"warning",timer:15000})
    else{
      var data={Crypto:crypto,MDP:Password,Email:Email.toLowerCase()}
      this.usersservice.Update_password(data).subscribe((data:any)=>{
        console.log(data)
        if(data.etat=="dead")
        {swal({title:"Ce lien n'est plus valide",type:"error"});this.forgetForm.reset()}
        else
        swal({title:"Modification reussis!",type:"success"}).then(()=>{
          this.router.navigate(['/Connexion'])
        })
      })
    }
  }

}
