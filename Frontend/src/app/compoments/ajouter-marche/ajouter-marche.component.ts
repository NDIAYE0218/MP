import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import { Router } from '@angular/router'
import { MarcheService } from '../../marche.service'
import { ContacteService } from '../../contacte.service'
import { DirectionService } from '../../direction.service'
import { Direction } from '../../Models/directions.model'
import { Service } from '../../Models/services.model'
import { Contact } from '../../Models/contact.model'
import {UserService} from '../../user.service'
import swal from 'sweetalert2';
import { Observable,Subscription, from } from 'rxjs';
import {  } from 'rxjs'
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
  form1: boolean; form2: boolean; form3: boolean
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
  soustraitant = []
  //variable d'ajout de fichier
  accept = '*'
  files:File[] = []
  progress:number
  url = 'http://localhost:4000/Marche/file_marche'
  hasBaseDropZoneOver:boolean = false
  httpEmitter:Subscription
  httpEvent:HttpEvent<{}>
  lastFileAt:Date
  sendableFormData:FormData
  droit=-1
  constructor(private userservice : UserService,private marcheservice: MarcheService, private contactservice: ContacteService, private directionService: DirectionService, private fb: FormBuilder, private router: Router,public HttpClient:HttpClient) {
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

      MontantMin: ['', Validators.nullValidator],
      MontantMax: ['', Validators.nullValidator],
      Montantutilise: ['', Validators.required],

      DureInitial: ['', Validators.required],
      DateDebut: ['', Validators.required],
      Observation: ['', Validators.nullValidator]
    })

    this.contactForm = this.fb.group({
      NomCont: ['', Validators.required],
      PrenomCont: ['', Validators.required],
      EmailCont: ['', [Validators.email, Validators.required]],
    })
    this.titulaireForm = this.fb.group({
      Nom: ['', Validators.required],
      Adresse_1: ['', [Validators.required]],
      Adresse_2: ['', Validators.nullValidator],
      CP: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      Ville: ['', Validators.required],
      Tel: ['', [Validators.nullValidator, Validators.minLength(10), Validators.maxLength(15)]],
      ContacteTit: ['', Validators.nullValidator],
      Mail: ['', [Validators.email, Validators.required]]
    })
    this.myControl = new FormControl();
  }
  ngOnInit() {
    //initialisation des vue 
    if(this.userservice.Access())
    {
      this.form1 = false; this.form2 = true; this.form3 = true
      this.fetchDirection();
    }
    else
    {
      this.router.navigate(['marches'])
    }
  }
  onSelect() {
    this.IsHidden = !this.IsHidden;
  }
  suivant_form1(NomDirection, NomService, Objet, Nature, TypeProcess, FormatProcess, TypeMarche, Nbr_rec, MontantMin, MontantMax, Montantutilise, DureInitial, DateDebut, Observation, Contacte) {
    //validation du premier formulaire
    //gestion des exception
    if (MontantMin > MontantMax && (MontantMin != 0 && MontantMax != 0))
      swal({ type: "warning", title: "Données incorecte", text: "le  Montant minimum € (TTC) dois être inferieure au Montant maximum € (TTC)", timer: 5000, showConfirmButton: false })
    else if (MontantMin > Montantutilise || MontantMax < Montantutilise && (MontantMin != 0 && MontantMax != 0))
      swal({ type: "warning", title: "Données incorecte", text: "Le Montant deboursé € (TTC) * dois être compris entre le Montant minimum € (TTC) et Montant maximum € (TTC)", timer: 5000, showConfirmButton: false })
    else if (TypeMarche != "Ferme" && Nbr_rec <= 1)
      swal({ type: "warning", title: "Données incorecte", text: "Le type de marché est reconductible alors le nombre de reconduction dois être suppérieur a 1", timer: 5000, showConfirmButton: false })
    else if (parseInt(Nbr_rec) > parseInt(DureInitial))
      {swal({ type: "warning", title: "Données incorecte", text: "Le nombre de reconduction dois être au minimum égale a la duré initiale en mois", timer: 5000, showConfirmButton: false })
}    else { //calcule des valeur généré
      this.contacte = (this.mailcontacte.length > 0) ? "" : Contacte
      for (var i = 0; i < this.mailcontacte.length; i++)
        this.contacte += this.mailcontacte[i] + ","
      var dtes = this.marcheservice.generateur_date(DateDebut, DureInitial, Nbr_rec)//genere la date de cloture et la date de 1er notification
      Nbr_rec = (Nbr_rec == 0) ? 1 : Nbr_rec
      //initialisation du premier compartiment du marché
      this.marche = {
        DG: NomDirection,
        serv: NomService,
        Contacte: this.contacte,
        objet: Objet,
        An: new Date().getFullYear().toString().substring(2),
        Nature: Nature,
        Type_process: TypeProcess,
        Format_process: FormatProcess,
        Type_Marche: TypeMarche,
        Nbr_reconduction: Nbr_rec,
        Montant_Min: MontantMin,
        Montant_Max: MontantMax,
        MontantConsome: Montantutilise,
        D_init: DureInitial,
        D_tot: DureInitial, // ala création la duré initiale es la même que la durée totale
        Date_debut: DateDebut,
        Observation: Observation,
        Date_Cloture_ini: dtes.dte_clo,
        D_clot: dtes.dte_clo,//a la création la date de cloture est la même que l'intiale
        DateNotific: dtes.dte_notif,
        Total_relance: 0,
        agent_enregist: "",//devra être égale au login de l'agent connecté après gestion de la connexion
      }
      this.form1 = !this.form1
      this.form2 = !this.form2
      // console.log(this.marche)
    }
  }
  suivant_form2(Nom, Tel, ContacteTit, Mail, Adresse_1, Adresse_2, CP, Ville, option) {
    //la valeur de option determinera si il s'agit d'une validation (1) ou de l'ajout d'un soustraitant (2)
    //initialisation du deuxième compartiment du marché
    var traitant = {
      Nom: Nom,
      Adresse_1: Adresse_1,
      Adresse_2: Adresse_2,
      CP: CP,
      Ville: Ville,
      Tel: Tel,
      Contacte: ContacteTit,
      Mail: Mail
    }
    if(this.nbr_ss_traitant == 0)
    this.marche.Titulaire=traitant
    else
    this.soustraitant.push(traitant)
    this.titulaireForm.reset()
    if (option == 2) {
      this.nbr_ss_traitant++;
      this.Titre_Traitant = "Informations sous traitant - cotraitant " + this.nbr_ss_traitant
    }
    else
    {
      //validation
      this.marche.SousTraitants=this.soustraitant
      //affichage du formulaire pièce jointe
      this.form1 = true; this.form2 = true; this.form3 = false
    }
  }
  AjouterFichier(files:File[]):Subscription{
    const req = new HttpRequest<FormData>('POST', this.url, this.sendableFormData, {
      reportProgress: true//, responseType: 'text'
    })
    return this.httpEmitter = this.HttpClient.request(req)
    .subscribe(
      event=>{
        this.httpEvent = event
        if (event instanceof HttpResponse) {
          delete this.httpEmitter
          interface Piece_Jointe {numero:number,chemins:string,nom:string}
          var ret=event.body as Piece_Jointe[]
          this.marche.Piece_Jointe=ret
          this.valider()
        }
      },
      error=>console.log('Erreur d\'importation: ',error)
    )
  }
  valider(){
    //webservice d'ajout de marché
    this.marcheservice.CreerMarcher(this.marche)
    swal({
      type:"success",
      title:"Ajout du marché réussi!"
    }).then(()=>{
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
  getDate(){
    return new Date()
  }
  
}