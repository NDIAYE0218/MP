var Marches = require('../app/models/MarcheInformatique')
const excelToJson = require('convert-excel-to-json');
module.exports = {
    ajouterMarcher: function (req, res) {
        var nouveuaMarche = new Marches(calcul_endDate(req.body))
        AddMarket(nouveuaMarche)
        res.json('ok')
    },
    RechercherMarcher:function (req, res) {
        Marches.find(req.body,function(err,marches){
            if(err)
            res.json('ko')
            else
            res.json(marches)
        })
    },
    UpdateMarket: function (req, res) {
        var marche=calcul_endDate(req.body)
        Marches.updateOne({ _id: marche._id }, marche, function (err) {
            if (err)
                console.log(err)
            else
                res.json('ok')
        })
    },
    DeleteMarket: function (req, res) {
        Marches.deleteOne({ _id: req.params._id }, function (err) {
            if (err)
                console.log(err)
            else
                res.json('ok')
        })
    },
    UploadMarket: function (req, res) {
        var Dossier_up = "./uploder/"
        var nbr_fichier = Object.keys(req.files.file).length
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
    }
}
function AddMarket(nouveuaMarche) {
    if(typeof nouveuaMarche.Num_nonExo=="undefined")
    {
        var dtt=new Date()
        nouveuaMarche.An=parseInt(dtt.getFullYear().toString().substring(2))
    }
    Marches.find({}, function (err, marche) {
        if (typeof nouveuaMarche.NumMarche == "undefined") {
            if(marche.length != 0)
            nouveuaMarche.NumMarche = (nouveuaMarche.An != marche[0].An) ? 1 : marche[0].NumMarche + 1//verification du changement d'année
            else
            nouveuaMarche.NumMarche =1
        }
        nouveuaMarche.save(function (err) {
            if (err)
                console.log(err)
        })
    })

}
function calcul_endDate(nouveuaMarche) {
    var dte = nouveuaMarche.DateNotification.split('/')[2] + "-" + nouveuaMarche.DateNotification.split('/')[1] + "-" + nouveuaMarche.DateNotification.split('/')[0]
    var event = new Date(dte);
    event.setMonth(event.getMonth() + nouveuaMarche.Duree)
    event.setDate(event.getDate() - 1)
    nouveuaMarche.DateFin = event.toLocaleDateString('fr-FR').split('-')[2]+"/"+event.toLocaleDateString('fr-FR').split('-')[1]+"/"+event.toLocaleDateString('fr-FR').split('-')[0]
    event.setMonth(event.getMonth() - 4)
    nouveuaMarche.DateAlerte = event.toLocaleDateString('fr-FR').split('-')[2]+"/"+event.toLocaleDateString('fr-FR').split('-')[1]+"/"+event.toLocaleDateString('fr-FR').split('-')[0]
    return nouveuaMarche
}
function traiteur_upload(result) {
    for (var i = 0; i < Object.keys(result).length; i++) {
        var data = result[Object.keys(result)[i]]

        for (var j = 4; j < Object.keys(data).length; j++) {
            marche = new Marches();
            marche.Num_nonExo=data[j].A
            marche.objet=data[j].B
            marche.Titulaire={

            },
            marche.Montant=data[j].D
        }

        }
}

