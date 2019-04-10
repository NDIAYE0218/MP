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
            nouveuaMarche.save(function
                (err) {
                if (err)
                    throw err
            })
        }).sort({ _id: -1 })

    },
    Associer_File_marche: function (req, res) {
        var Dossier_up = "./fichier_marche/"
        var nbr_fichier = Object.keys(req.files.file).length
        var dt = new Date()
        var date = dt.getDate() + "" + dt.getFullYear() + "" + dt.getMilliseconds() + "" + dt.getMonth() + "" + dt.getMinutes() + dt.getTime()
        if (typeof req.files.file.name != 'undefined') {
            var nom_fichier = Dossier_up+date+"_"+ req.files.file.name
            //enregistrement provisoire du fichier
            req.files.file.mv(nom_fichier, function (err) {
              if (err) {
                throw err
              }
              res.json([{numero:0,nom:date+"_"+ req.files.file.name}])
            })
          }
          //boucle sur plusieur fichiers quand name n'existe pas
          else {
            var ret=[]
            for (var i = 0; i < nbr_fichier; i++) {
              var nom_fichier = Dossier_up +date+"_"+ req.files.file[i].name
              var nom=date+"_"+ req.files.file[i].name
              //enregistrement provisoire du fichier
              req.files.file[i].mv(nom_fichier, function (err) {
                if (err) {
                  throw err
                }
              })
              ret.push({numero:i,nom:nom})
              if(i==nbr_fichier-1)
              res.json(ret)
            }
          }
    }
    ,
    downoald_file: function(req,res){
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
        var _id=req.params.id
        var marche=req.body
        Marches.updateOne({_id:_id},marche, function(err){
            if(err)
            console.log('eurreur')
            else
            console.log("okkk")
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
    relancerMarcher: function (req, res) {
    }
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
                marche.An = data[j].C.substring(0, 2)
                marche.NumMarche = data[j].C.substring(data[j].C.length - 3, data[j].C.length)
                marche.Contacte = data[j].E
                marche.DG = data[j].A
                marche.serv = data[j].B
                marche.MontantTotal = (typeof data[j].F == 'undefined' || typeof data[j].F == 'string') ? 0 : data[j].F
                marche.Observation = (typeof data[j].AG == 'undefined') ? '' : data[j].AG
                marche.Date_Cloture = formatedate(data[j].AC)
                marche.DateNotific = CreerDateNotification(formatedate(data[j].AC), data[j].M)
                //gestion type Process et format process
                if (typeof data[j].G != 'undefined') { marche.Type_process = "MAPA"; marche.Format_process = "RECONDUCTIBLE"; }
                if (typeof data[j].H != 'undefined') { marche.Type_process = "MAPA"; marche.Format_process = "FERME" }
                if (typeof data[j].I != 'undefined') { marche.Type_process = "AO"; marche.Format_process = "RECONDUCTIBLE" }
                if (typeof data[j].J != 'undefined') { marche.Type_process = "AO"; marche.Format_process = "FERME" }
                if (typeof data[j].K != 'undefined') { marche.Type_process = "CONCESSION"; marche.Format_process = "FERME" }
                //creation des tableau
                //tableau de duree
                var duree = [{ D_init: data[j].M, D_tot: data[j].O, nb_rec: data[j].N, D_clot: formatedate(data[j].P) }]
                marche.Duree = duree
                //tableau des année (3ans) ce faits en fonction du format_process et du type process
                var annee = [], relance = []
                if (typeof data[j].G != 'undefined') //reconduction MAPA
                    annee = [{ DRecond: formatedate(data[j].Q), DteSS: data[j].S, CourRec: data[j].T }, { DRecond: formatedate(data[j].U), DteSS: data[j].W, CourRec: data[j].X }, { DRecond: formatedate(data[j].Y), DteSS: data[j].AA, CourRec: data[j].BB }]
                if (typeof data[j].I != 'undefined') //reconductible AO
                    annee = [{ DRecond: formatedate(data[j].R), DteSS: data[j].S, CourRec: data[j].T }, { DRecond: formatedate(data[j].V), DteSS: data[j].W, CourRec: data[j].X }, { DRecond: formatedate(data[j].Z), DteSS: data[j].AA, CourRec: data[j].BB }]
                relance = (typeof data[j].AD != 'undefined' && data[j].AD != '') ? [{ type: "MAPA", date: formatedate(data[j].AD), dure: data[j].M }] : (typeof data[j].AE != 'undefined' && data[j].AE != '') ? [{ type: "AO", date: formatedate(data[j].AE), dure: data[j].M }] : (typeof data[j].AF != 'undefined' && data[j].AF != '') ? [{ type: "CONCESSION", date: formatedate(data[j].AF), dure: data[j].M }] : []
                // ajout a marche
                marche.Duree = duree
                marche.Annee = annee
                marche.Relance = relance
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