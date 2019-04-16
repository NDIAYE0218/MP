import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  uri = 'http://localhost:4000';
  constructor(private http: HttpClient) { }
  GetAll(){
    return this.http.get(`${this.uri}/Users`)
  }
  Delete(_id){
    return this.http.delete(`${this.uri}/Users`+_id)
  }
  Ajouter_utilisateur(users){
  return  this.http.post(`${this.uri}/Users`,users)
  }
  Forget_password(recherche,option){
    return  this.http.post(`${this.uri}/Users/Forget/`+option,recherche)
  }
  Update_password(data){
    return this.http.put(`${this.uri}/Users/password`,data)
  }
}
