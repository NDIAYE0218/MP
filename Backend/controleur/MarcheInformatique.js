var Marches = require('../app/models/MarcheInformatique')
const excelToJson = require('convert-excel-to-json');
const nodemailer = require("nodemailer")
var transporter = nodemailer.createTransport('smtp://webmail.ville-clichy.fr/') //smtp du webmail de la ville
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
    },
    AlertMarket: function(req,res){
        var dte= new Date('2022-4-1')
        var dte_val=dte.getDate()+"/"+(dte.getMonth()+1)+"/"+dte.getFullYear()
        Marches.find({DateAlerte:dte_val},function(err,marches){
            for(var i=0;i<marches.length;i++){
                if(marches[i].ActiveAlerte>-1){
                    var num_marche = (marches[i].NumMarche.toString().length == 1) ? marches[i].An + "-00" + marches[i].NumMarche : (marches[i].NumMarche.toString().length == 2) ? marches[i].An + "-0" + marches[i].NumMarche :(typeof marches[i].Num_nonExo!='undefined')?marches[i].Num_nonExo: marches[i].An + "-" + marches[i].NumMarche + ""
                    var message='<span style="width: 100%;font-size: 140%">Bonjour,<br>'+
                    'Les clauses du contrat N° <b style="width: 100%;color:blue">'+num_marche+'</b> notifiées le <i>'+marches[i].DateNotification+'</i> ayant pour objet <b>'+marches[i].Objet+'</b>, arrivera à échéance dans <U>'+(marches[i].ActiveAlerte+1)+' mois jour pour jour</U>.<br>'+
                    'Vous pouvez voir les détails de ce contrat en cliquant <a href="http://amp.mairie-clichy.fr/Informatique/#/marches/'+marches[i]._id+'">ici</a>.<br>'+
                    'En cas de modification du marché (reconduction ou toute autre action, merci de le modifier sur la plateforme <a href="http://amp.mairie-clichy.fr/Informatique/#/marches/'+marches[i]._id+'">AMP)</a>.<br>Merci.'
                    mailer("Alerte fin de contrat", message, "babacar.ndiaye@ville-clichy.fr")
                    marches[i].ActiveAlerte=marches[i].ActiveAlerte-1
                    var dte= new Date('2022-4-1');dte.setMonth(dte.getMonth()+1)
                    marches[i].DateAlerte=dte.getDate()+"/"+(dte.getMonth()+1)+"/"+dte.getFullYear()
                    Marches.updateOne({ _id: marches[i]._id }, marches[i], function (err) {if (err)console.log(err)})
                }
            }
        })
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
        nouveuaMarche.ActiveAlerte=3
        nouveuaMarche.save(function (err) {
            if (err)
                console.log(err)
        })
    })

}
function calcul_endDate(nouveuaMarche) {
    var dte = nouveuaMarche.DateNotification.split('/')[2] + "-" + nouveuaMarche.DateNotification.split('/')[1] + "-" + nouveuaMarche.DateNotification.split('/')[0]
    var event = new Date(dte);
    var year= (nouveuaMarche.Duree-(nouveuaMarche.Duree%12))/12
    var month=(nouveuaMarche.Duree%12)
    event.setFullYear(event.getFullYear()+year)
    event.setMonth(event.getMonth() + month)
    event.setDate(event.getDate() - 1)
    nouveuaMarche.DateFin = event.toLocaleDateString('fr-FR').split('-')[2]+"/"+event.toLocaleDateString('fr-FR').split('-')[1]+"/"+event.toLocaleDateString('fr-FR').split('-')[0]
    event.setMonth(event.getMonth() - 4)
    nouveuaMarche.DateAlerte = event.toLocaleDateString('fr-FR').split('-')[2]+"/"+event.toLocaleDateString('fr-FR').split('-')[1]+"/"+event.toLocaleDateString('fr-FR').split('-')[0]
    return nouveuaMarche
}
function traiteur_upload(result) {
    for (var i = 0; i < Object.keys(result).length; i++) {
        var data = result[Object.keys(result)[i]]
        for (var j = 1; j < Object.keys(data).length; j++) {
            marche = new Marches()
            if(typeof data[j].E !="undefined" && typeof data[j].B!="undefined"){
            marche.Num_nonExo=(typeof data[j].A!="undefined")?data[j].A:""
            marche.Objet=(typeof data[j].B!="undefined")?data[j].B:""
            marche.NomTitulaire=(typeof data[j].C!="undefined")?data[j].C:""
            marche.Montant=(typeof data[j].D=="number")?data[j].D:1
            var dte= new Date(data[j].E);dte.setDate(dte.getDate()+1)
            var dte_f=dte.getDate()+"/"+(dte.getMonth()+1)+"/"+dte.getFullYear()
            marche.DateNotification=dte_f
            marche.Duree=(typeof data[j].F!="undefined")?data[j].F:0
            marche.TypeReconduction=(typeof data[j].I!="undefined")?data[j].I:""
            marche.Observation=(typeof data[j].J!="undefined")?data[j].J:""
            marche.CP=""
            marche.Adresse=""
            marche.Mail=""
            marche.Tel=""
            var marche=calcul_endDate(marche)
            AddMarket(marche)
        }
        }
        }
}
function mailer(subject, message, to) {
    var mailOptions = {
        from: '"Ne pas repondre (Alerte des Marchés Publics-Informatique)" <neparepondre.AMP@ville-clichy.fr>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: 'ne pas repondre, mail automatique',
        html: message // html body
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('notification envoyé: ' + info.response);
    })
}

