var Marches = require('../app/models/Marches')
const excelToJson = require('convert-excel-to-json');
module.exports = {
    listeMarchers: function (req, res) {
        Marches.find({}, function (err, marche) {
            res.json(marche)
        }).sort({ _id: -1 })
    },
    getMarcher: function (req, res) {
        Marches.findOne({ "NumMarche": req.params.num, "An": req.params.an }, function (err, marche) {
            if (err)
                throw err;
            res.json(marche)
        })
    },
    ajouterMarcher: function (req, res) {
        var nouveuaMarche = new Marches(req.body);
        Marches.find({}, function (err, marche) {
            nouveuaMarche['NumMarche'] = 1
            if (marche.length != 0) {
                nouveuaMarche.NumMarche = (nouveuaMarche.An != marche[0].An) ? 1 : marche[0].NumMarche + 1//verification du changement d'année
            }
            Marches.findOne({DateNotific:nouveuaMarche.DateNotific,objet:nouveuaMarche.objet,serv:nouveuaMarche.serv},function(err,marche){
                if(marche==null)
                nouveuaMarche.save(function
                    (err) {
                    if (err)
                        throw err
                })
            })
        }).sort({ _id: -1 })

    },
    Associer_File_marche: function (req, res) {
        var Dossier_up = "./fichier_marche/"
        var nbr_fichier = Object.keys(req.files.file).length
        var dt = new Date()
        var date = dt.getDate() + "" + dt.getFullYear() + "" + dt.getMilliseconds() + "" + dt.getMonth() + "" + dt.getMinutes() + dt.getTime()
        if (typeof req.files.file.name != 'undefined') {
            var nom_fichier = Dossier_up + date + "_" + req.files.file.name
            //enregistrement provisoire du fichier
            req.files.file.mv(nom_fichier, function (err) {
                if (err) {
                    throw err
                }
                res.json([{ numero: 0, nom: date + "_" + req.files.file.name }])
            })
        }
        //boucle sur plusieur fichiers quand name n'existe pas
        else {
            var ret = []
            for (var i = 0; i < nbr_fichier; i++) {
                var nom_fichier = Dossier_up + date + "_" + req.files.file[i].name
                var nom = date + "_" + req.files.file[i].name
                //enregistrement provisoire du fichier
                req.files.file[i].mv(nom_fichier, function (err) {
                    if (err) {
                        throw err
                    }
                })
                ret.push({ numero: i, nom: nom })
                if (i == nbr_fichier - 1)
                    res.json(ret)
            }
        }
    },
    downoald_file: function (req, res) {
        var __dirname = "./fichier_marche/"
        res.sendFile(req.params.nomfichier, { root: __dirname });
    },
    uploderMarche: function (req, res) {
        //cette fonction se sert de la sous fonction traiteur_upload pour inserer les marché un par un 
        var Dossier_up = "./uploder/"
        var nbr_fichier = Object.keys(req.files.file).length
        //gestion un fichier si name existe
        if (typeof req.files.file.name != 'undefined') {
            var nom_fichier = Dossier_up + req.files.file.name
            //enregistrement provisoire du fichier
            req.files.file.mv(nom_fichier, function (err) {
                if (err) {
                    throw err
                }
                const result = excelToJson({ sourceFile: nom_fichier });
                traiteur_upload(result)
                res.send({ "retour": "Importation a réussi!" })
            })
        }
        //boucle sur plusieur fichiers quand name n'existe pas
        else {
            for (var i = 0; i < nbr_fichier; i++) {
                var nom_fichier = Dossier_up + req.files.file[i].name
                //enregistrement provisoire du fichier
                req.files.file[i].mv(nom_fichier, function (err) {
                    if (err) {
                        throw err
                    }
                    //conversion de xlsx a json    
                    var result = excelToJson({ sourceFile: nom_fichier });
                    //enregistrement des données en BD
                    traiteur_upload(result)
                })
                if (i == nbr_fichier - 1)
                    res.send({ "retour": "Importation a réussi!" })
            }
        }

    },
    modifierMarcher: function (req, res) {
        var _id = req.params.id
        var marche = req.body
        Marches.updateOne({ _id: _id }, marche, function (err) {
            if (err)
                console.log('eurreur')
            else
                res.send("ok")
        })
    },
    supprimerMarcher: function (req, res) {
        Marches.deleteOne({ An: req.params.an, NumMarche: req.params.num }, function (err) {
            if (err)
                throw err
            res.json({ success: "success" })
        })
    },
    rechercherMarcher: function (req, res) {
        Marches.find({ "An": req.params.an }, function (err, marche) {
            if (err)
                throw err;
            res.json(marche)
        }).sort({ _id: -1 })
    },
    statistiques: function (req, res) {
        Marches.find({}, function (err, marche) {
            res.json(stat_finances(marche, parseInt(req.params.option)))
        })
    },
    getDetailNotification: function(req,res){
        Marches.find({}, function (err, marche) {
            var ret=[]
            var dte=new Date()
            dte.setMonth(dte.getMonth()+1)
            for(var i=0;i<marche.length;i++){
            if(marche[i].Date_Cloture_ini.split('/')[2]==dte.getFullYear() && marche[i].Date_Cloture_ini.split('/')[1]>=dte.getMonth())
            ret.push(marche[i])
            }
            var ret1=sort_marche(ret,0)
            res.json(sort_marche(ret1))
        })

    }
}
function stat_finances(data, option) {
    var Ret = { Label: [], Montant_min: [], Montant_max: [] }
    if (option == 0) {
        for (var i = 0; i < data.length; i++) {
            if (Ret.Label.includes(data[i].DG)) {
                var j = Ret.Label.indexOf(data[i].DG)
                Ret.Montant_min[j] += data[i].Montant_Min_HT_glob
                Ret.Montant_max[j] += data[i].Montant_Max_HT_glob
            }
            else {
                Ret.Label.push(data[i].DG)
                Ret.Montant_min.push(data[i].Montant_Min_HT_glob)
                Ret.Montant_max.push(data[i].Montant_Max_HT_glob)
            }
        }
       
    }
    if(option==1){
        for (var i = 0; i < data.length; i++) {
            if (Ret.Label.includes(data[i].serv)) {
                var j = Ret.Label.indexOf(data[i].serv)
                Ret.Montant_min[j] += data[i].Montant_Min_HT_glob
                Ret.Montant_max[j] += data[i].Montant_Max_HT_glob
            }
            else {
                Ret.Label.push(data[i].serv)
                Ret.Montant_min.push(data[i].Montant_Min_HT_glob)
                Ret.Montant_max.push(data[i].Montant_Max_HT_glob)
            }
        }
      
    }
    if(option==2){
        for (var i = 0; i < data.length; i++) {
            if (Ret.Label.includes("20"+data[i].An)) {
                var j = Ret.Label.indexOf("20"+data[i].An)
                Ret.Montant_min[j] += data[i].Montant_Min_HT_glob
                Ret.Montant_max[j] += data[i].Montant_Max_HT_glob
            }
            else
            {
                Ret.Label.push("20"+data[i].An)
                Ret.Montant_min.push(data[i].Montant_Min_HT_glob)
                Ret.Montant_max.push(data[i].Montant_Max_HT_glob)
            }
        }
       
    }
    if(option==3){
        for (var i = 0; i < data.length; i++) {
            if (Ret.Label.includes(data[i].Type_Marche)) {
                var j = Ret.Label.indexOf(data[i].Type_Marche)
                Ret.Montant_min[j] +=1 
            }
            else
            {
                Ret.Label.push(data[i].Type_Marche)
                Ret.Montant_min.push(1)
            }
        }
       
    }
    if(option==4){
        for (var i = 0; i < data.length; i++) {
            if (Ret.Label.includes(data[i].Format_process)) {
                var j = Ret.Label.indexOf(data[i].Format_process)
                Ret.Montant_min[j] +=1 
            }
            else
            {
                Ret.Label.push(data[i].Format_process)
                Ret.Montant_min.push(1)
            }
        }
       
    }
    if(option==5){
        for (var i = 0; i < data.length; i++) {
            if (Ret.Label.includes(data[i].Type_process)) {
                var j = Ret.Label.indexOf(data[i].Type_process)
                Ret.Montant_min[j] +=1 
            }
            else
            {
                Ret.Label.push(data[i].Type_process)
                Ret.Montant_min.push(1)
            }
        }
       
    }
    if(option==6){
        for (var i = 0; i < data.length; i++) {
            if (Ret.Label.includes(data[i].Nature)) {
                var j = Ret.Label.indexOf(data[i].Nature)
                Ret.Montant_min[j] +=1 
            }
            else
            {
                Ret.Label.push(data[i].Nature)
                Ret.Montant_min.push(1)
            }
        }
       
    }
    return Ret
}
function sort_marche(data,option=1){
    var ret=[]  
    if(option) //trie mensuelle
    {for(var i=0;i<13;i++)
    {
      for(var j=0;j<data.length;j++)
      if(parseInt(data[j].Date_Cloture_ini.split('/')[1])==i)
      {
        ret.push(data[j])
        data.splice(j,1)
      }
    }}
    else //trie journalier
    {for(var i=0;i<32;i++)
        {
          for(var j=0;j<data.length;j++){
            if(parseInt(data[j].Date_Cloture_ini.split('/')[0])==i)
          {
            ret.push(data[j])
            data.splice(j,1)
          }
        }
        }}
    return ret
  }
  
function traiteur_upload(result) {
    //fonction permettant l'insertion des marchés
    /**
     * principe de fonctionnement, considère les colone A --> AG du fichier passer en paramètre, verifie qu'il son definit
     *  *** si indefinit les ajoute en champs vident
     *  *** si definit ajoute leur valeur a un fichier json respectant le format mongoose de la BD avant leur ajout
     */
    //parcour des datasheet
    for (var i = 0; i < Object.keys(result).length; i++) {
        var data = result[Object.keys(result)[i]] //selection du datasheet
        //on ne considère pas les 4 premieres lignes de chaque datasheet qui sont utilisé pour les intitulé
        //parcourt des ligne du tableau
        for (var j = 4; j < Object.keys(data).length; j++) {
            marche = new Marches();
            if (typeof data[j].C != 'undefined') {
                marche.objet = data[j].D
                marche.Date_debut=data[j].L+"$$"
                marche.Datecreation=getDate()// faire monter la solution mais avan réglé le problède de date de création
                marche.An = data[j].C.substring(0, 2)
                marche.NumMarche = data[j].C.substring(data[j].C.length - 3, data[j].C.length)
                marche.Total_relance = 0
                marche.DateNotific = CreerDateNotification(formatedate(data[j].AC), data[j].M)
                marche.Nature = ""
                marche.agent_enregist=""
                //gestion type Process et format process
                if (typeof data[j].G != 'undefined') { marche.Type_process = "MAPA"; marche.Format_process = "RECONDUCTIBLE"; }
                if (typeof data[j].H != 'undefined') { marche.Type_process = "MAPA"; marche.Format_process = "FERME" }
                if (typeof data[j].I != 'undefined') { marche.Type_process = "AO"; marche.Format_process = "RECONDUCTIBLE" }
                if (typeof data[j].J != 'undefined') { marche.Type_process = "AO"; marche.Format_process = "FERME" }
                if (typeof data[j].K != 'undefined') { marche.Type_process = "CONCESSION"; marche.Format_process = "FERME" }
                marche.Type_Marche = ""
                marche.Montant_Min_HT_ini = 0
                marche.Montant_Max_HT_ini = 0
                marche.Montant_Max_TTC_ini = 0
                marche.Montant_Min_TTC_ini = 0
                marche.Montant_Min_HT_glob = 0
                marche.Montant_Min_TTC_glob = 0
                marche.Montant_Max_TTC_glob = 0
                marche.Montant_Max_HT_glob = (typeof data[j].F == 'undefined' || typeof data[j].F == 'string') ? 0 : data[j].F
                marche.Nbr_reconduction = (typeof data[j].N == 'undefined' || typeof data[j].N == 'string') ? 0 : data[j].N
                marche.Observation = (typeof data[j].AG == 'undefined') ? '' : data[j].AG
                marche.Date_Cloture_ini = formatedate(data[j].P)
                marche.D_clot = formatedate(data[j].AC)
                marche.Contacte = data[j].E
                marche.DG = data[j].A
                marche.serv = data[j].B
                marche.D_init = (typeof data[j].M == 'undefined') ? 0 : data[j].M
                marche.D_tot = (typeof data[j].O == 'undefined') ? 0 : data[j].O
                marche.Titulaire = []
                marche.Piece_Jointe = []
                marche.historique = []
                marche.Tranche_optionnel=[]
                marche.save(function
                    (err) {
                    if (err)
                        throw err
                })
            }
        }
    }

}
function formatedate(dte) {
    date = (typeof dte != 'undefined') ? new Date(dte) : new Date()
    var ret = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
    return ret
}
function CreerDateNotification(dte, nb_mois) {
    var format = dte.split('/');
    dte = format[1] + "/" + format[0] + "/" + format[2]
    nb_mois = (typeof nb_mois != 'undefined') ? Math.floor(nb_mois / 3) : 3; //la première notification seras generé 1/3 du temps avant la fin du contrat initiale
    var dateclo = new Date(dte)
    dateclo.setMonth(dateclo.getMonth() - nb_mois);
    let month = String(dateclo.getMonth() + 1);
    let day = String(dateclo.getDate());
    const year = String(dateclo.getFullYear());
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return day + "/" + month + "/" + year;
}
function   getDate() {
    var event = new Date();
    var ret= event.toLocaleDateString('fr-FR').split('-')
    return ret[2]+"/"+ret[1]+"/"+ret[0]
  }