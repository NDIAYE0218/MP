import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from "angular2-cookie/core";
import * as CryptoJS from 'crypto-js';
import {Router} from '@angular/router'
@Injectable({
  providedIn: 'root'
})
export class UserService {
  uri = 'http://amp.mairie-clichy.fr:4000';
  // uri = 'http://localhost:4000';
  constructor(private http: HttpClient, private cookieservice: CookieService,private route:Router) { }
  GetAll() {
    return this.http.get(`${this.uri}/Users`)
  }
  Delete(_id) {
    return this.http.delete(`${this.uri}/Users/` + _id)
  }
  Ajouter_utilisateur(users) {
    return this.http.post(`${this.uri}/Users`, users)
  }
  Forget_password(recherche, option) {
    return this.http.post(`${this.uri}/Users/Forget/` + option, recherche)
  }
  Update_password(data) {
    return this.http.put(`${this.uri}/Users/password`, data)
  }
  Connexion(recherche) {
    return this.http.post(`${this.uri}/Users/Connexion`, recherche)
  }
  CreateCookie(data) {
    var cookie=this.cryto_json(data)
    this.cookieservice.put("access",cookie.tempo)
    this.cookieservice.put("time",cookie.gene)
  }
  Access(){
    return (typeof this.cookieservice.get('access')!="undefined" && typeof this.cookieservice.get('time')!="undefined")
  }
  InfoUser(){
    var tempo=this.cookieservice.get('access')
    var gene=this.cookieservice.get('time')
    return this.decrypto_json(tempo,gene)
  }
  Deconnexion(){
    this.cookieservice.removeAll()
    this.route.navigate(['/Connexion'])
  }
  cryto_json(data) {
    var gene = this.randomstring(100)
    var cle = CryptoJS.enc.Utf8.parse(gene);
    var iv = CryptoJS.enc.Utf8.parse(gene);
    var val = JSON.stringify(data)
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(val.toString()), cle,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
    return { tempo: encrypted.toString(), gene: gene }
  }
  decrypto_json(str_obj, gene) {
    var cle = CryptoJS.enc.Utf8.parse(gene);
    var iv = CryptoJS.enc.Utf8.parse(gene);
    var decrypted = CryptoJS.AES.decrypt(str_obj, cle, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
  }
  randomstring(L) {
    var s = '';
    var randomchar = function () {
      var n = Math.floor(Math.random() * 62);
      if (n < 10) return n; //1-10
      if (n < 36) return String.fromCharCode(n + 55); //A-Z
      return String.fromCharCode(n + 61); //a-z
    }
    while (s.length < L) s += randomchar();
    return s;
  }
}
