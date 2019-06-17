import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user.service'
import { ContacteService } from '../../contacte.service'
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import { DirectionService } from '../../direction.service'
import { Router, ActivatedRoute } from '@angular/router'
import { MarcheService } from '../../marche.service'
import swal from 'sweetalert2';
import {
  HttpClient, HttpRequest,
  HttpResponse, HttpEvent
} from '@angular/common/http'
import { Observable, Subscription, from } from 'rxjs';
@Component({
  selector: 'app-avenant',
  templateUrl: './avenant.component.html',
  styleUrls: ['./avenant.component.css']
})
export class AvenantComponent implements OnInit {
  avenantForm: FormGroup
  createForm: FormGroup
  titulaireForm: FormGroup
  chx_modif: FormGroup
  contactForm: FormGroup
  hasBaseDropZoneOver: boolean = false
  httpEmitter: Subscription
  httpEvent: HttpEvent<{}>
  lastFileAt: Date
  sendableFormData: FormData
  accept = '*'
  files: File[] = []
  progress: number
  url = 'http://localhost:4000/Marche/file_marche'
  directions = [];
  services = [];
  contacts = [];
  marche = []
  mailcontacte: string[] = []
  display_trnche_op = false
  display: boolean = false
  vu_titulaire = false
  vu_avenant = false
  vu_option = false
  vu_modif = false
  vu_modif_f1 = true
  vu_modif_f2 = false
  vu_modif_f3 = false
  vu_modif_f4=false
  IsHidden_1 = false;
  IsHidden = true
  clkr = false
  alert_montant_1 = true
  alert_montant_2 = true
  alert_montant_3 = true
  montant_dispo = 0
  constructor(private directionService: DirectionService,public HttpClient: HttpClient, private marcheservice: MarcheService, private contactservice: ContacteService, private userservice: UserService, private fb: FormBuilder, private router: Router, private params: ActivatedRoute) {
    this.chx_modif = this.fb.group({
      choix: ['', Validators.required]
    })
    this.avenantForm = this.fb.group({
      Objet: ['', Validators.required],
      Resume: ['', [Validators.required, Validators.maxLength(500)]],
      Montant: ['', Validators.required],
      Dure: ['', Validators.nullValidator]
    })
    this.titulaireForm = this.fb.group({
      NomTit: ['', Validators.required],
      Adresse: ['', [Validators.required]],
      NomContact: ['', [Validators.required]],
      Telephone: ['', [Validators.nullValidator, Validators.minLength(14), Validators.maxLength(16)]],
      Mail: ['', [Validators.email, Validators.required]],
      Montant: ['', [Validators.required]]
    })
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
    this.createForm.controls.MontantMin_TTC_glob.disable();
    this.createForm.controls.MontantMax_TTC_glob.disable();
    this.createForm.controls.MontantMin_HT_glob.disable();
    this.createForm.controls.MontantMax_HT_glob.disable();
    this.createForm.controls.DureGlobal.disable();
  }

  ngOnInit() {
    if (!this.userservice.Access() || this.userservice.InfoUser().Droit < 2)
      this.userservice.Deconnexion()
    else {
      var numero = this.params.snapshot.paramMap.get('id')
      var id = numero.split('-')
      var NumMarche = id[1]
      var An = id[0]
      this.fetchMarche(NumMarche, An)
      this.fetchDirection();
    }
  }
  fetchMarche(NumMarche, An) {
    this.marcheservice.getMarche(NumMarche, An).subscribe((data: any) => {
      if (data != null && Object.keys(data).length > 1) {
        this.marche = data;
        this.display_trnche_op = (data.Format_process == "Tranches optionnelles")
        this.display = true
        for (var i = 0; i < data['Titulaire'].length; i++)
          this.montant_dispo += this.marche['Titulaire'][i].Montant
      }
      else
        swal('Introuvable', 'Aucun marché ne correspond a ce numero', 'warning').then(() => { this.router.navigate(['/marches']) })
    })
  }
  crerTitulaire(NomTit, Adresse, Mail, Montant, Nomcont, tel) {
    Montant = parseInt(Montant)
    var montan_att = 0
    for (var i = 0; i < this.marche['Titulaire'].length; i++)
      montan_att += this.marche['Titulaire'][i].Montant
    var montant_dispo = parseInt(this.marche['Montant_Max_HT_glob']) - montan_att
    if (parseInt(this.marche['Montant_Max_HT_glob']) != 0) {
      if (montant_dispo - parseInt(Montant) >= 0) {
        this.marche['Titulaire'].push({ Nom: NomTit, Adresse: Adresse, Mail: Mail + "$$" + Nomcont + "$$" + tel, Montant: Montant, SousTraitants: [] })
        this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
        this.marcheservice.updateMarches(this.marche, this.marche['_id'])
        swal({ type: "success", text: "Ajout réussi, vous pouvez ratacher des sous-traitants a ce co-traitant dans l'onglet titulaire et sous traitant" }).then(() => { this.router.navigate(['/marches']) })
      }
      else
        swal({ text: "le montant dois être inferieur ou égal a " + montant_dispo, type: "warning" })
    }
    else {
      this.marche['Titulaire'].push({ Nom: NomTit, Adresse: Adresse, Mail: Mail + "$$" + Nomcont + "$$" + tel, Montant: Montant, SousTraitants: [] })
      this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
      this.marcheservice.updateMarches(this.marche, this.marche['_id'])
      swal({ type: "success", text: "Ajout réussi, vous pouvez ratacher des sous-traitants a ce co-traitant dans l'onglet titulaire et sous traitant" }).then(() => { this.router.navigate(['/marches']) })
    }
  }
  Avenant(Objet, Montant, Resume, dure) {
    Montant = parseInt(Montant)
    dure = parseInt(dure)
    var nvdure = parseInt(this.marche['D_init']) + dure
    var _dates_glob = this.marcheservice.generateur_date(this.reordonne(this.marche['Date_debut']), nvdure * (parseInt(this.marche['Nbr_reconduction']) + 1), this.marche['Nbr_reconduction'])
    var _dates_init = this.marcheservice.generateur_date(this.reordonne(this.marche['Date_debut']), nvdure, this.marche['Nbr_reconduction'])
    if (parseInt(this.marche['Montant_Max_HT_glob']) != 0) {
      var montan_att = 0
      for (var i = 0; i < this.marche['Titulaire'].length; i++)
        montan_att += this.marche['Titulaire'][i].Montant
      var montant_dispo = parseInt(this.marche['Montant_Max_HT_glob']) - montan_att
      if (montant_dispo + Montant >= 0 && nvdure > 0) {
        this.marche['historique'].push({ numModif: (this.marche['historique'].length + 1), Objet: Objet, Montant: Montant, Resume: Resume, auteur: this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom, date: dure + " mois" })
        this.marche['Montant_Max_HT_glob'] = parseInt(this.marche['Montant_Max_HT_glob']) + Montant
        this.marche['D_init'] = nvdure
        this.marche['DureGlobal'] = nvdure * parseInt(this.marche['Nbr_reconduction'])
        this.marche['D_clot'] = _dates_glob.dte_clo
        this.marche['DateNotific'] = _dates_init.dte_notif
        this.marche['Date_Cloture_ini'] = _dates_init.dte_clo
        this.marche['Date_reconduction_courante'] = _dates_init.dte_clo
        this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
        this.marcheservice.updateMarches(this.marche, this.marche['_id'])
        swal({ type: "success", text: "Avenant ajouté avec succes!" }).then(() => { this.router.navigate(['/marches']) })
      }
      else
        swal({ type: "warning", text: "Cette action es impossible une partie du budget a déja été alloué a des (co)traitants la reduction maximal possible es de " + montant_dispo + "€ \n nous vous invitons a reduire le budget des (co)traitans et a réhiterer votre action ou la duré ajouté es incorecte" })
    }
    else {
      if (Montant >= 0 && nvdure > 0) {
        this.marche['historique'].push({ numModif: (this.marche['historique'].length + 1), Objet: Objet, Montant: Montant, Resume: Resume, auteur: this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom, date: dure + " mois" })
        this.marche['Montant_Max_HT_glob'] = parseInt(this.marche['Montant_Max_HT_glob']) + Montant
        this.marche['D_init'] = nvdure
        this.marche['DureGlobal'] = nvdure * parseInt(this.marche['Nbr_reconduction'])
        this.marche['D_clot'] = _dates_glob.dte_clo
        this.marche['DateNotific'] = _dates_init.dte_notif
        this.marche['Date_Cloture_ini'] = _dates_init.dte_clo
        this.marche['Date_reconduction_courante'] = _dates_init.dte_clo
        this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
        this.marcheservice.updateMarches(this.marche, this.marche['_id'])
        swal({ type: "success", text: "Avenant ajouté avec succes!" }).then(() => { this.router.navigate(['/marches']) })
      }
      else
        swal({ type: "warning", text: "Cette action es impossible, le budget ou la duré ne peuvent être négatif" })
    }
  }
  optionnel_act(Objet, Montant, Resume) {
    Montant = parseInt(Montant)
    this.marche['Montant_Max_HT_glob'] = parseInt(this.marche['Montant_Max_HT_glob']) + Montant
    this.marche['Tranche_optionnel'].push({ condition: Objet, Montant: Montant, Observation: Resume, auteur: this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom, date: this.genedate() })
    this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
    this.marcheservice.updateMarches(this.marche, this.marche['_id'])
    swal({ type: "success", text: "La tranche optionnel" + this.marche['Tranche_optionnel'].length + " a été ajouté avec succès" }).then(() => { this.router.navigate(['/marches']) })
  }
  vu_act(option) {
    if (option == -1) {
      this.vu_titulaire = false
      this.vu_avenant = false
      this.vu_option = false
      this.vu_modif = true
      this.vu_modif_f1=true
    }
    if (option == 0) {
      this.vu_titulaire = true
      this.vu_avenant = false
      this.vu_option = false
      this.vu_modif = false
    }
    if (option == 1) {
      this.vu_titulaire = false
      this.vu_avenant = true
      this.vu_option = false
      this.vu_modif = false
      this.avenantForm.reset()
    }
    if (option == 2) {
      this.vu_titulaire = false
      this.vu_avenant = false
      this.vu_option = true
      this.vu_modif = false
      this.avenantForm.reset()
    }
  }
  genedate() {
    var event = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return (event.toLocaleDateString('fr-FR', options));
  }
  reordonne(dte) {
    return dte.split('/')[1] + "/" + dte.split('/')[0] + "/" + dte.split('/')[2]
  }
  active_vue_act_men(option) {
    this.vu_modif_f1 = false
    if (option == 0) {
      this.vu_modif_f2 = true
      this.vu_modif_f3 = false
      this.vu_modif_f4 = false
    }
    if (option == 1) {
      this.vu_modif_f2 = false
      this.vu_modif_f3 = true
      this.vu_modif_f4 = false
    }
    if (option == 2) {
      this.vu_modif_f2 = false
      this.vu_modif_f3 = false
      this.vu_modif_f4 = true
    }
  }
  fetchDirection() {
    this.directionService.getDirections().subscribe((data: any) => {
      for (var i = 0; i < data.length; i++) {
        this.directions.push(data[i].Nom)
      }
      this.mailcontacte = this.marche['Contacte'].split(',')
    })
  }
  fetchServices(direction) {
    this.clkr = true
    if (typeof direction == 'undefined')
      direction = this.marche['DG']
    if (direction != '') {
      this.directionService.getService(direction).subscribe((data: any) => {
        this.services = data
      })
    }
    else
      swal('Veuillez choisir une direction pour afficher la liste de ces services')
  }
  fetchContactes(service) {
    service = (typeof service == 'undefined') ? this.marche['serv'] : service
    if (service != '') {
      let serv = this.services.find(elem => elem.Nom === service);
      if (typeof serv == 'undefined')
        swal('Veuillez choisir un service pour afficher la liste de ces contacts')
      else {
        var id_serv = serv.NumServ
        this.contactservice.getContacte(id_serv).subscribe((data: any) => {
          this.contacts = data
        })
      }
    }
    else
      swal('Veuillez choisir un service pour afficher la liste de ces contacts')
  }
  addcont(contact) {
    this.IsHidden_1 = false
    if (!this.mailcontacte.includes(contact)) { this.mailcontacte.push(contact); this.marche['Contacte'] = this.mailcontacte.join(','); this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom; this.marcheservice.updateMarches(this.marche, this.marche['_id']) }
    else
      swal({ title: "Ce contacte existe déja", text: "Verifier la liste", type: "warning" })
  }
  supp_contact(i) { this.mailcontacte.splice(i, 1); this.marche['Contacte'] = this.mailcontacte.join(','); this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom; this.marcheservice.updateMarches(this.marche, this.marche['_id']) }
  onSelect() {
    this.IsHidden = !this.IsHidden;
  }
  creerContact(NomDirection, NomService, NomCont, PrenomCont, EmailCont) {
    if (NomService != '' && this.clkr == true) {
      NomService = (typeof NomService == "undefined") ? this.marche['serv'] : NomService
      NomDirection = (typeof NomDirection == "undefined") ? this.marche['DG'] : NomDirection
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
  ModificationInfoGeneral(option, valeur) {
    // 22 option de modif automatique et personnalisé
    //la modification des informations de l'auteur de la modif
    this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
    if (option == 0 && typeof valeur != undefined)
      this.marche['DG'] = valeur
    if (option == 1 && typeof valeur != undefined)
      this.marche['serv'] = valeur
    if (option == 2 && typeof valeur != undefined)
      this.marche['objet'] = valeur
    if (option == 3 && typeof valeur != undefined)
      this.marche['Nature'] = valeur
    if (option == 3 && typeof valeur != undefined)
      this.marche['Nature'] = valeur
    if (option == 4 && typeof valeur != undefined)
      this.marche['Type_process'] = valeur
    if (option == 5 && typeof valeur != undefined) {
      this.marche['Format_process'] = valeur
      this.marche['Tranche_optionnel'] = [];
      if (valeur != 'Accord cadre') {
        this.marche['Montant_Min_HT_ini'] = this.marche['Montant_Max_HT_ini'] = this.marche['Montant_Min_TTC_ini'] = this.marche['Montant_Max_TTC_ini'] = this.marche['Montant_Max_TTC_ini'] = this.marche['Montant_Min_HT_glob'] = this.marche['Montant_Min_TTC_glob'] = this.marche['Montant_Max_TTC_glob'] = 0
      }
    }
    if (option == 6 && typeof valeur != undefined) {
      this.marche['Type_Marche'] = valeur
      if (valeur == 'Ferme') this.marche['Nbr_reconduction'] = 1
    }
    if (option == 7 && typeof valeur != undefined) {
      if (parseInt(valeur) < 0)
        swal("entrez une valeur supperieur a zero")
      else {
        this.marche['Nbr_reconduction'] = parseInt(valeur)
        var _dates_glob = this.marcheservice.generateur_date(this.marche['Date_debut'], this.marche['D_init'] * this.marche['Nbr_reconduction'], parseInt(valeur))
        var _dates_init = this.marcheservice.generateur_date(this.marche['Date_debut'], this.marche['D_init'], parseInt(valeur))
        this.marche['D_clot'] = _dates_glob.dte_clo
        this.marche['DateNotific'] = _dates_init.dte_notif
        this.marche['Date_Cloture_ini'] = _dates_init.dte_clo
      }
    }
    if (option == 8 && valeur != undefined)
      this.marche['Observation'] = valeur
    //validation de l'enregistrement
    this.marcheservice.updateMarches(this.marche, this.marche['_id'])
  }
  Montantglobal(searchValue: string, option) {
    if (option == 0) {
      var montant = parseInt(this.marche['Nbr_reconduction']) * this.createForm.controls.MontantMin_HT_ini.value
      this.createForm.controls.MontantMin_HT_glob.setValue("" + montant); this.marche['Montant_Min_HT_glob'] = montant; this.marche['Montant_Min_HT_ini'] = this.createForm.controls.MontantMin_HT_ini.value
    }
    if (option == 1) {
      montant = this.createForm.controls.MontantMax_HT_ini.value * parseInt(this.marche['Nbr_reconduction'])
      if (this.createForm.controls.MontantMin_HT_ini.value > this.createForm.controls.MontantMax_HT_ini.value || this.montant_dispo > montant)
        this.alert_montant_1 = true
      else {
      this.alert_montant_1 = false
        montant = this.createForm.controls.MontantMax_HT_ini.value * parseInt(this.marche['Nbr_reconduction'])
        this.createForm.controls.MontantMax_HT_glob.setValue("" + montant); this.marche['Montant_Max_HT_glob'] = montant; this.marche['Montant_Max_HT_ini'] = this.createForm.controls.MontantMax_HT_ini.value
      }
    }
    if (option == 2) {
      montant = this.createForm.controls.MontantMin_TTC_ini.value * parseInt(this.marche['Nbr_reconduction'])
      this.createForm.controls.MontantMin_TTC_glob.setValue("" + montant); this.marche['Montant_Min_TTC_glob'] = montant; this.marche['Montant_Min_TTC_ini'] = this.createForm.controls.MontantMin_TTC_ini.value
    }
    if (option == 3) {
      if (this.createForm.controls.MontantMin_TTC_ini.value > this.createForm.controls.MontantMax_TTC_ini.value)
        this.alert_montant_2 = true
      else {
      this.alert_montant_2 = false
        montant = this.createForm.controls.MontantMax_TTC_ini.value * parseInt(this.marche['Nbr_reconduction'])
        this.createForm.controls.MontantMax_TTC_glob.setValue("" + montant); this.marche['Montant_Max_TTC_glob'] = montant; this.marche['Montant_Max_TTC_ini'] = this.createForm.controls.MontantMax_TTC_ini.value
      }
    }
    if (option == 4) {
      var duree = this.createForm.controls.DureInitial.value * (parseInt(this.marche['Nbr_reconduction']))
      this.createForm.controls.DureGlobal.setValue("" + duree); this.marche['D_tot'] = duree; this.marche['D_init'] = this.createForm.controls.DureInitial.value
      var _dates_glob = this.marcheservice.generateur_date(this.marche['Date_debut'], this.marche['D_init'] * this.marche['Nbr_reconduction'], this.marche['Nbr_reconduction'])
      var _dates_init = this.marcheservice.generateur_date(this.marche['Date_debut'], this.marche['D_init'], this.marche['Nbr_reconduction'])
      this.marche['D_clot'] = _dates_glob.dte_clo
      this.marche['DateNotific'] = _dates_init.dte_notif
      this.marche['Date_Cloture_ini'] = _dates_init.dte_clo
    }
    if (option == 5) {
      this.marche['Nbr_reconduction'] = parseInt(this.createForm.controls.Nbr_rec.value)
      var montant = parseInt(this.marche['Nbr_reconduction']) * this.createForm.controls.MontantMin_HT_ini.value
      this.createForm.controls.MontantMin_HT_glob.setValue("" + montant); this.marche['Montant_Min_HT_glob'] = montant; this.marche['Montant_Min_HT_ini'] = this.createForm.controls.MontantMin_HT_ini.value
      montant = this.createForm.controls.MontantMax_HT_ini.value * parseInt(this.marche['Nbr_reconduction'])
      if (this.createForm.controls.MontantMin_HT_ini.value > this.createForm.controls.MontantMax_HT_ini.value || this.montant_dispo > montant)
        this.alert_montant_1 = true
      else {
      this.alert_montant_1 = false
        montant = this.createForm.controls.MontantMax_HT_ini.value * parseInt(this.marche['Nbr_reconduction'])
        this.createForm.controls.MontantMax_HT_glob.setValue("" + montant); this.marche['Montant_Max_HT_glob'] = montant; this.marche['Montant_Max_HT_ini'] = this.createForm.controls.MontantMax_HT_ini.value
      }
      montant = this.createForm.controls.MontantMin_TTC_ini.value * parseInt(this.marche['Nbr_reconduction'])
      this.createForm.controls.MontantMin_TTC_glob.setValue("" + montant); this.marche['Montant_Min_TTC_glob'] = montant; this.marche['Montant_Min_TTC_ini'] = this.createForm.controls.MontantMin_TTC_ini.value
      if (this.createForm.controls.MontantMin_TTC_ini.value > this.createForm.controls.MontantMax_TTC_ini.value)
        this.alert_montant_2 = true
      else {
      this.alert_montant_2 = false
        montant = this.createForm.controls.MontantMax_TTC_ini.value * parseInt(this.marche['Nbr_reconduction'])
        this.createForm.controls.MontantMax_TTC_glob.setValue("" + montant); this.marche['Montant_Max_TTC_glob'] = montant; this.marche['Montant_Max_TTC_ini'] = this.createForm.controls.MontantMax_TTC_ini.value
      }
      var duree = this.createForm.controls.DureInitial.value * (parseInt(this.marche['Nbr_reconduction']))
      this.createForm.controls.DureGlobal.setValue("" + duree); this.marche['D_tot'] = duree; this.marche['D_init'] = this.createForm.controls.DureInitial.value
      var _dates_glob = this.marcheservice.generateur_date(this.marche['Date_debut'], this.marche['D_init'] * this.marche['Nbr_reconduction'], this.marche['Nbr_reconduction'])
      var _dates_init = this.marcheservice.generateur_date(this.marche['Date_debut'], this.marche['D_init'], this.marche['Nbr_reconduction'])
      this.marche['D_clot'] = _dates_glob.dte_clo
      this.marche['DateNotific'] = _dates_init.dte_notif
      this.marche['Date_Cloture_ini'] = _dates_init.dte_clo
      montant = this.createForm.controls.MontantMax_HT_Forfetaire.value
      if (this.montant_dispo < montant) { this.marche['Montant_Max_HT_glob'] = montant; this.alert_montant_3 = false }
      else
        this.alert_montant_3 = true
    }
    if (option == 6) {
      montant = this.createForm.controls.MontantMax_HT_Forfetaire.value
      if (this.montant_dispo < montant) { this.marche['Montant_Max_HT_glob'] = montant; this.alert_montant_3 = false }
      else
        this.alert_montant_3 = true
    }
    if (option == 7) {
      console.log("test")
      //gestion de la date
      this.marche['Date_debut'] = this.createForm.controls.DateDebut.value.split('-')[2] + '/' + this.createForm.controls.DateDebut.value.split('-')[1] + '/' + this.createForm.controls.DateDebut.value.split('-')[0]
      var _dates_glob = this.marcheservice.generateur_date(this.marche['Date_debut'], this.marche['D_init'] * this.marche['Nbr_reconduction'], this.marche['Nbr_reconduction'])
      var _dates_init = this.marcheservice.generateur_date(this.marche['Date_debut'], this.marche['D_init'], this.marche['Nbr_reconduction'])
      this.marche['D_clot'] = _dates_glob.dte_clo
      this.marche['DateNotific'] = _dates_init.dte_notif
      this.marche['Date_Cloture_ini'] = _dates_init.dte_clo
    }
    this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
    this.marcheservice.updateMarches(this.marche, this.marche['_id'])
  }
  ModificationInfoTitulaire(option, valeur,i){
    this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
    if(option==0)
      this.marche['Titulaire'][i].Nom=valeur
      if(option==1)
      this.marche['Titulaire'][i].Mail=this.splitdet(this.marche['Titulaire'][i].Mail,valeur,1)
      if(option==2)
      this.marche['Titulaire'][i].Mail=this.splitdet(this.marche['Titulaire'][i].Mail,valeur,0)
      if(option==3)
      this.marche['Titulaire'][i].Mail=this.splitdet(this.marche['Titulaire'][i].Mail,valeur,2)
      if(option==4)
      this.marche['Titulaire'][i].Adresse=valeur
      if(option==5){
        console.log((this.marche['Montant_Max_HT_glob']-this.montant_dispo+this.marche['Titulaire'][i].Montant))
        if(parseInt(valeur)>(this.marche['Montant_Max_HT_glob']-this.montant_dispo+this.marche['Titulaire'][i].Montant))
        swal("le montant maximal dois être inferieur ou égal à "+(this.marche['Montant_Max_HT_glob']-this.montant_dispo+this.marche['Titulaire'][i].Montant))
        else
        this.marche['Titulaire'][i].Montant=parseInt(valeur)
      }
    this.marcheservice.updateMarches(this.marche, this.marche['_id'])
  }
  delete_traitant(i){
    this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
    this.marche['Titulaire'].splice(i,1)
    this.marcheservice.updateMarches(this.marche, this.marche['_id'])
  }
  splitdet(valeur_st,valeur_mod,option){
    var ret_tab=valeur_st.split('$$')
    ret_tab[option]=valeur_mod
    return ret_tab.join('$$')
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
            for(var k=0;k<ret.length;k++)
            this.marche['Piece_Jointe'].push(ret[k])
            this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
            this.marcheservice.updateMarches(this.marche, this.marche['_id'])
          }
        },
        error => console.log('Erreur d\'importation: ')
      )
  }
  delete_pj(i){
    this.marche['Piece_Jointe'].splice(i,1)
    this.marche['agent_enregist'] = "Modifié le " + this.genedate() + " par " + this.userservice.InfoUser().Nom + " " + this.userservice.InfoUser().Prenom
            this.marcheservice.updateMarches(this.marche, this.marche['_id'])
  }
  getDate() {
    var event = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return event.toLocaleDateString('fr-FR', options)
  }
}