var Marches = require('../app/models/Marches')
const nodemailer = require("nodemailer")
var transporter = nodemailer.createTransport('smtp://webmail.ville-clichy.fr/') //smtp du webmail de la ville
module.exports = {
    Scrutteur_Notification: function () {
        //generation de la date d'aujourd'hui en bon format
        var tdy = new Date(); var month = String((tdy.getMonth() + 1)); var day = String(tdy.getDate())
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        var date = day + '/' + month + '/' + tdy.getFullYear()
        // scrutage de la Base de données
        Marches.find({ "DateNotific": date }, function (err, marche) {
            //selection de tous les marché dont la date de notification est aujourd'hui:
            for (var i = 0; i < marche.length; i++) {
                var Total_relance = (typeof marche[i].Total_relance == 'undefined') ? 1 : marche[i].Total_relance + 1
                //update du nombre de relance et de la nouvelle date de notification
                var marche_up = marche[i]; marche_up["Total_relance"] = Total_relance; marche_up["DateNotific"] = CreerDateNotification(marche[i].Date_Cloture,marche[i].Duree[0].D_init,Total_relance)
                Marches.updateOne({ "_id": marche[i]._id }, { $set: marche_up }).exec()
                //fin modif
                mailer(marche[i].Contacte,  marche[i].An, marche[i].NumMarche,marche[i].objet,marche[i].Date_Cloture)//envoie de la notification
            }
        })
    }
}

//pour l'envoie de mail
function mailer(to, An, NumMarche,objet,Date_Cloture) {
    var subject = 'Alerte Marché N°' + An + '-' + NumMarche
    var lien = "http://localhost:4200/marches/" + An + '-' + NumMarche
    var message = 'Bonjour Mme(Mr) ' + to.substring(0, 14).split('.')[1] + ' ' + to.substring(0, 14).split('.')[0] +
        ',<br>Le marche ayant pour objet: <b>' + objet + '</b>, arrive bientôt a échéhance.<br>' +
        '<h2>La date de cloture est la suivante: <i>' + Date_Cloture + '</i>.</h2>' +
        '<br> vous pouvez voir les détails du marché <a href="' + lien + '">ici</a>.'
    var mailOptions = {
        from: '"Ne pas repondre (Alerte des Marchés Publics)" <neparepondre.AMP@ville-clichy.fr>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: 'ne pas repondre mail automatique',
        html: message // html body
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    })
}

function CreerDateNotification(dte, nb_mois, nbr_relance) {
    // var format = dte.split('/');
    // dte = format[1] + "/" + format[0] + "/" + format[2]
    nb_mois = (typeof nb_mois != 'undefined') ? Math.floor(nb_mois / (2 * (nbr_relance+1))) : 3; //la première notification seras generé 1/3 du temps avant la fin du contrat initiale
    var dateclo = new Date(dte)
    dateclo.setMonth(dateclo.getMonth() - nb_mois);
    let month = String(dateclo.getMonth() + 1);
    let day = String(dateclo.getDate());
    const year = String(dateclo.getFullYear());
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return day + "/" + month + "/" + year;
}