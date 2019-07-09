import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import { Router } from '@angular/router'
import { MarcheService } from '../../marche.service'
import { ContacteService } from '../../contacte.service'
import { DirectionService } from '../../direction.service'
import { Direction } from '../../Models/directions.model'
import { Service } from '../../Models/services.model'
import { Contact } from '../../Models/contact.model'
import { UserService } from '../../user.service'
import swal from 'sweetalert2';
import { Observable, Subscription, from } from 'rxjs';
import { } from 'rxjs'
import {
  HttpClient, HttpRequest,
  HttpResponse, HttpEvent
} from '@angular/common/http'
@Component({
  selector: 'app-ajouter-marche',
  templateUrl: './ajouter-marche.component.html',
  styleUrls: ['./ajouter-marche.component.css']
})
export class AjouterMarcheComponent implements OnInit {
  createForm: FormGroup;
  titulaireForm: FormGroup;
  contactForm: FormGroup;
  myControl: FormControl;
  IsHidden = true;
  form1: boolean; form3: boolean;
  form2 = true
  IsHidden_1 = true;
  directions: string[] = [];
  services: Service[];
  contacts: Contact[];
  Titre_Traitant = "Informations titulaire du marché"
  nbr_ss_traitant = 0
  filteredDirections: Observable<string[]>;
  mailcontacte: string[] = []
  contacte = ""
  marche: any
  titulaire = []
  //variable d'ajout de fichier
  accept = '*'
  files: File[] = []
  progress: number
  // url = 'http://amp.mairie-clichy.fr:4000/Marche/file_marche'
  url = 'http://localhost:4000/Marche/file_marche';
  hasBaseDropZoneOver: boolean = false
  httpEmitter: Subscription
  httpEvent: HttpEvent<{}>
  lastFileAt: Date
  sendableFormData: FormData
  droit = -1
  Montant_dispo = 0;
  alert_montant_1 = false
  alert_montant_2 = false
  vuordinaire = false
  vuac = false
  plc_h="du titulaire"
  constructor(private userservice: UserService, private marcheservice: MarcheService, private contactservice: ContacteService, private directionService: DirectionService, private fb: FormBuilder, private router: Router, public HttpClient: HttpClient) {
    this.createForm = this.fb.group({
      NomDirection: ['', Validators.required],
      NomService: ['', Validators.required],
      Contacte: ['', [Validators.required]],
      Objet: ['', Validators.required],
      Nature: ['', Validators.required],
      TypeProcess: ['', Validators.required],
      FormatProcess: ['', Validators.required],
      TypeMarche: ['', Validators.required],
      Nbr_rec: ['', Validators.nullValidator],

      MontantMin_TTC_ini: ['', Validators.nullValidator],
      MontantMax_TTC_ini: ['', Validators.nullValidator],
      MontantMin_HT_ini: ['', [Validators.nullValidator]],
      MontantMax_HT_ini: ['', Validators.nullValidator],
      MontantMax_HT_Forfetaire: ['', Validators.nullValidator],
      MontantMin_TTC_glob: ['', Validators.nullValidator],
      MontantMax_TTC_glob: ['', Validators.nullValidator],
      MontantMin_HT_glob: ['', Validators.nullValidator],
      MontantMax_HT_glob: ['', Validators.nullValidator],

      DureInitial: ['', Validators.required],
      DureGlobal: ['', Validators.nullValidator],
      DateDebut: ['', Validators.required],
      Observation: ['', Validators.nullValidator]
    })
    this.contactForm = this.fb.group({
      NomCont: ['', Validators.required],
      PrenomCont: ['', Validators.required],
      EmailCont: ['', [Validators.email, Validators.required]],
    })
    this.titulaireForm = this.fb.group({
      NomTit: ['', Validators.required],
      Adresse: ['', [Validators.required]],
      NomContact: ['', [Validators.required]],
      Telephone: ['', [Validators.nullValidator, Validators.minLength(14), Validators.maxLength(16)]],
      Mail: ['', [Validators.email, Validators.required]],
      Montant: ['', [Validators.required]]
    })
    this.myControl = new FormControl();
    this.createForm.controls.MontantMin_TTC_glob.disable();
    this.createForm.controls.MontantMax_TTC_glob.disable();
    this.createForm.controls.MontantMin_HT_glob.disable();
    this.createForm.controls.MontantMax_HT_glob.disable();
    this.createForm.controls.DureGlobal.disable();
  }
  ngOnInit() {
    //disabled of montant
    //initialisation des vue 
    if (this.userservice.Access()) {
      this.form1 = false; this.form2 = true; this.form3 = true
      this.fetchDirection();
    }
    else {
      this.router.navigate(['marches'])
    }
  }
  onSelect() {
    this.IsHidden = !this.IsHidden;
  }

  crerTitulaire(NomTit, Adresse, Mail, Montant,Nom,Telephone) {
    var type = this.createForm.controls.FormatProcess.value
    if (type == "")
      swal({ text: "Choisissez une forme de marché", type: "warning" })
    else {
      if (this.Montant_dispo == 0 && this.createForm.controls.MontantMax_HT_glob.value == 0 && this.createForm.controls.MontantMax_HT_Forfetaire.value == 0) {
        this.titulaire.push({ Nom: NomTit, Adresse: Adresse, Mail: Mail+"$$"+Nom+"$$"+Telephone, Montant: parseInt(Montant), SousTraitants: [] })
        this.plc_h="(co)traitant(s)"
        this.titulaireForm.reset()
      }
      else if ((this.Montant_dispo - Montant) >= 0) {
      this.Montant_dispo = this.Montant_dispo - Montant
        this.titulaire.push({ Nom: NomTit, Adresse: Adresse,  Mail: Mail+"$$"+Nom+"$$"+Telephone, Montant: parseInt(Montant), SousTraitants: [] })
        this.plc_h="(co)traitant(s)"
        this.titulaireForm.reset()
      }
      else
        swal({ text: "le montant attribuer a ce titulaire dois être inferieur ou égal à " + (this.Montant_dispo), type: "warning" })
    }
  }
  sous_traitant(titul, Mail_0, NomTit_0, Adresse_0, Montant_0,Nom,Telephone) {
    var montant_attribue = 0
    for (var i = 0; i < titul.SousTraitants.length; i++)
      montant_attribue += titul.SousTraitants[i].Montant
    var montant = titul.Montant - montant_attribue
    if (montant - Montant_0 >= 0) { titul.SousTraitants.push({ Nom: NomTit_0, Adresse: Adresse_0, Mail: Mail_0+"$$"+Nom+"$$"+Telephone, Montant: parseInt(Montant_0) }); this.titulaireForm.reset() }
    else
      swal({ text: "le montant attribuer a ce sous-traitant dois être inferieur ou égal à " + (montant), type: "warning" })
  }
  suivant_form1(Date_debut) {
    //recuperation des variable
    var NomDirection = this.createForm.controls.NomDirection.value; var NomService = this.createForm.controls.NomService.value; var Contacte = this.createForm.controls.Contacte.value; var Objet = this.createForm.controls.Objet.value
    var Nature = this.createForm.controls.Nature.value; var TypeProcess = this.createForm.controls.TypeProcess.value; var FormatProcess = this.createForm.controls.FormatProcess.value; var TypeMarche = this.createForm.controls.TypeMarche.value
    var Nbr_rec = parseInt(this.createForm.controls.Nbr_rec.value) + 1; var MontantMin_TTC_ini = this.createForm.controls.MontantMin_TTC_ini.value; var MontantMax_TTC_ini = this.createForm.controls.MontantMax_TTC_ini.value; var MontantMin_HT_ini = this.createForm.controls.MontantMin_HT_ini.value
    var MontantMax_HT_ini = this.createForm.controls.MontantMax_HT_ini.value; var MontantMin_TTC_glob = this.createForm.controls.MontantMin_TTC_glob.value; var MontantMax_TTC_glob = this.createForm.controls.MontantMax_TTC_glob.value; var MontantMin_HT_glob = this.createForm.controls.MontantMin_HT_glob.value; var MontantMax_HT_glob = this.createForm.controls.MontantMax_HT_glob.value
    var DureInitial = this.createForm.controls.DureInitial.value; var DureGlobal = this.createForm.controls.DureGlobal.value; var DateDebut = this.createForm.controls.DateDebut.value; var Observation = this.createForm.controls.Observation.value
    var _dates_glob = this.marcheservice.generateur_date(DateDebut, DureGlobal, Nbr_rec)
    var _dates_init = this.marcheservice.generateur_date(DateDebut, DureInitial, Nbr_rec)
    this.contacte = (this.mailcontacte.length > 0) ? "" : Contacte
    for (var i = 0; i < this.mailcontacte.length; i++)
      this.contacte += this.mailcontacte[i] + ","
    //fabrication partiel du json
    this.marche = {
      objet: Objet,
      An: new Date().getFullYear().toString().substring(2),
      Total_relance: 0,//total des notification, aide au calcul de la date des notification
      DateNotific: _dates_init.dte_notif,
      Datecreation: this.getDate_t(),
      Nature: Nature,
      Type_process: TypeProcess,
      Format_process: FormatProcess,
      Type_Marche: TypeMarche,
      Montant_Min_HT_ini: isNaN(parseInt(MontantMin_HT_ini)) ? 0 : MontantMin_HT_ini,
      Montant_Max_HT_ini: isNaN(parseInt(MontantMax_HT_ini)) ? 0 : MontantMax_HT_ini,
      Montant_Min_TTC_ini: isNaN(parseInt(MontantMin_TTC_ini)) ? 0 : MontantMin_TTC_ini,
      Montant_Max_TTC_ini: isNaN(parseInt(MontantMax_TTC_ini)) ? 0 : MontantMax_TTC_ini,
      Montant_Min_HT_glob: isNaN(parseInt(MontantMin_HT_glob)) ? 0 : parseInt(MontantMin_HT_glob),
      Montant_Max_HT_glob: isNaN(parseInt(MontantMax_HT_glob)) ? parseInt(this.createForm.controls.MontantMax_HT_Forfetaire.value) : parseInt(MontantMax_HT_glob),
      Montant_Min_TTC_glob: isNaN(parseInt(MontantMin_TTC_glob)) ? 0 : parseInt(MontantMin_TTC_glob),
      Montant_Max_TTC_glob: isNaN(parseInt(MontantMax_TTC_glob)) ? 0 : parseInt(MontantMax_TTC_glob),
      Nbr_reconduction: isNaN(Nbr_rec) ? 0 : Nbr_rec,
      Observation: Observation,
      Date_Cloture_ini: _dates_init.dte_clo,
      Date_debut: Date_debut,
      D_clot: _dates_glob.dte_clo,
      Contacte: this.contacte,
      DG: NomDirection,
      serv: NomService,
      D_init: DureInitial,
      D_tot: parseInt(DureGlobal),
      agent_enregist: "Modifié le "+this.getDate()+" par "+this.userservice.InfoUser().Nom+" "+this.userservice.InfoUser().Prenom,
      Date_reconduction_courante: _dates_init.dte_clo,
      Tot_rec_effectue: 0,
      bloque: 0,
      Titulaire: this.titulaire,
      Piece_Jointe: [],
      historique: [],
      Annee: [],
      Tranche_optionnel: []
    }
    this.form1 = true; this.form2 = false; this.form3 = true
  }
  suivant_form2() {
    this.form1 = true; this.form2 = true; this.form3 = false
  }
  AjouterFichier(files: File[]): Subscription {
    const req = new HttpRequest<FormData>('POST', this.url, this.sendableFormData, {
      reportProgress: true//, responseType: 'text'
    })
    return this.httpEmitter = this.HttpClient.request(req)
      .subscribe(
        event => {
          this.httpEvent = event
          if (event instanceof HttpResponse) {
            delete this.httpEmitter
            interface Piece_Jointe { numero: number, chemins: string, nom: string }
            var ret = event.body as Piece_Jointe[]
            this.marche.Piece_Jointe = ret
            this.valider()
          }
        },
        error => console.log('Erreur d\'importation: ')
      )
  }
  valider() {
    //webservice d'ajout de marché
    this.marcheservice.CreerMarcher(this.marche).subscribe(() => { })
    swal({
      type: "success",
      title: "Ajout du marché réussi!"
    }).then(() => {
      this.router.navigate(['/marches'])
    })
  }
  precedent_form1() {
    this.form1 = !this.form1
    this.form2 = !this.form2
  }
  creerContact(NomDirection, NomService, NomCont, PrenomCont, EmailCont) {
    if (NomService != '') {
      let serv = this.services.find(elem => elem.Nom === NomService);
      var NumService = serv.NumServ
      this.contactservice.CreateContacte(NomDirection, NumService, NomCont, PrenomCont, EmailCont)
      this.IsHidden = !this.IsHidden;
      swal("Contacte ajouté")
    }
    else {
      swal('oups!', 'Veuillez choisir un service SVP', 'warning')
    }
  }
  fetchDirection() {
    this.directionService.getDirections().subscribe((data: Direction[]) => {
      for (var i = 0; i < data.length; i++) {
        this.directions.push(data[i].Nom)
      }
    })
  }
  fetchServices(direction) {
    if (direction != '') {
      this.directionService.getService(direction).subscribe((data: Service[]) => {
        this.services = data
      })
    }
    else
      swal('Veuillez choisir une direction pour afficher la liste de ces services')
  }
  fetchContactes(service) {
    if (service != '') {
      let serv = this.services.find(elem => elem.Nom === service);
      var id_serv = serv.NumServ
      this.contactservice.getContacte(id_serv).subscribe((data: Contact[]) => {
        this.contacts = data
      })
    }
    else
      swal('Veuillez choisir un service pour afficher la liste de ces contacts')
  }
  addcont(contact) {
    this.IsHidden_1 = false
    if (!this.mailcontacte.includes(contact))
      this.mailcontacte.push(contact)
    else
      swal({ title: "Ce contacte existe déja", text: "Verifier la liste", type: "warning" })
  }
  getDate() {
    var event = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return event.toLocaleDateString('fr-FR', options)
  }
  Montantglobal(searchValue: string, option) {
    if (option == 0) {
      var montant = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.MontantMin_HT_ini.value
      this.createForm.controls.MontantMin_HT_glob.setValue("" + montant)
    }
    if (option == 1) {
      if (this.createForm.controls.MontantMin_HT_ini.value > this.createForm.controls.MontantMax_HT_ini.value)
        this.alert_montant_1 = true
      else
        this.alert_montant_1 = false
      var montant = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.MontantMax_HT_ini.value
      this.createForm.controls.MontantMax_HT_glob.setValue("" + montant)
      this.Montant_dispo = montant
    }
    if (option == 2) {
      var montant = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.MontantMin_TTC_ini.value
      this.createForm.controls.MontantMin_TTC_glob.setValue("" + montant)
    }
    if (option == 3) {
      if (this.createForm.controls.MontantMin_TTC_ini.value > this.createForm.controls.MontantMax_TTC_ini.value)
        this.alert_montant_2 = true
      else
        this.alert_montant_2 = false
      var montant = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.MontantMax_TTC_ini.value
      this.createForm.controls.MontantMax_TTC_glob.setValue("" + montant)
    }
    if (option == 4) {
      var duree = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.DureInitial.value
      this.createForm.controls.DureGlobal.setValue("" + duree)
    }
    if (option == 5) {
      var montant = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.MontantMin_HT_ini.value
      this.createForm.controls.MontantMin_HT_glob.setValue("" + montant)
      montant = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.MontantMax_HT_ini.value
      this.createForm.controls.MontantMax_HT_glob.setValue("" + montant)
      this.Montant_dispo = montant
      montant = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.MontantMin_TTC_ini.value
      this.createForm.controls.MontantMin_TTC_glob.setValue("" + montant)
      montant = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.MontantMax_TTC_ini.value
      this.createForm.controls.MontantMax_TTC_glob.setValue("" + montant)
      duree = (this.createForm.controls.Nbr_rec.value + 1) * this.createForm.controls.DureInitial.value
      this.createForm.controls.DureGlobal.setValue("" + duree)
    }
    if (option == 6) {
      montant = this.createForm.controls.MontantMax_HT_Forfetaire.value
      this.Montant_dispo = montant
    }
  }
  active_vue_act(option) {
    if (option == 0) { this.vuac = true; this.vuordinaire = false }
    else {
      this.vuac = false; this.vuordinaire = true
    }

  }
  getDate_t(){
    var event = new Date();
    return event.toLocaleDateString('fr-FR')
  }
}