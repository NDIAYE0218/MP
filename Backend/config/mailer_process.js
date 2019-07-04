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
        // scrutage des date de notification (envoie  a tous les contactes du marché et a la commande public)
        Marches.find({ "DateNotific": date }, function (err, marche) {
            //selection de tous les marché dont la date de notification est aujourd'hui:
            for (var i = 0; i < marche.length; i++) {
                var to = marche[i].Contacte + ",Babacar.NDIAYE@ville-clichy.fr"
                var mess = Message_texte(marche[i], 0)
                mailer(mess.subject, mess.message, to)
            }
        })
        //redefinition du mois
        month = String((tdy.getMonth()) + 2)
        if (month.length < 2) month = '0' + month;
        var date = day + '/' + month + '/' + tdy.getFullYear()
        Marches.find({ "D_clot": date, "Type_Marche": "Ferme" }, function (err, marche) {
            //selection de tous les marché dont la date de cloture est le mois prochain et dont le type de marché es ferme (sans reconduction):
            for (var i = 0; i < marche.length; i++) {
                var to = marche[i].Contacte + ",Babacar.NDIAYE@ville-clichy.fr"
                var mess = Message_texte(marche[i], 1)
                mailer(mess.subject, mess.message, to)
            }
        })
        Marches.find({ "Date_reconduction_courante": date }, function (err, marche) {
            //selection de tous les marchés (reconductible) dont la datecourante de reconduction est le mois prochain :
            for (var i = 0; i < marche.length; i++) {
                var to = marche[i].Contacte + ",Babacar.NDIAYE@ville-clichy.fr"
                var mess = ""
                if (marche[i].Date_reconduction_courante == marche[i].D_clot)
                    mess = Message_texte(marche[i], 2)
                else {
                    var march = marche[i]
                    mess = Message_texte(march, 1)

                    if (march.Type_Marche == "Reconduction tacite") {
                        //si la reconduction es tacite on active la reconduction du marché
                        march.Total_relance = (march.Total_relance == 0) ? 1 : march.Total_relance
                        update_reconductionDate(march, calcul_date_rec(march).dte, calcul_date_rec(march).an)
                    }
                    else {
                        //si la reconduction es express on laisse a l'utilisateur le soins de reconduire ou non le du marché
                        march.bloque = 1
                        update_reconductionDate(march, march.Date_reconduction_courante, march.Total_relance)
                    }
                }
                mailer(mess.subject, mess.message, to)
            }
        })
    },
    Reconduction_expresse: function (req, res) {
        //elle permet a l'utilisateur d'activer la reconduction d'un marché reconductible expressement
        var _id = req.params._id
        Marches.findOne({ "_id": _id, "Type_Marche": "Reconduction expresse" }, function (err, marche) {
            if (marche != null) {
                var modif = (typeof marche.bloque != "undefined" && (marche.bloque == 0 || marche.Date_reconduction_courante == marche.D_clot)) ? false : true //verification qu'on a bien le droit de modifier
                if (modif) {
                    marche.bloque = 0 //si on modifie on bloque la modification jusqu'au nouvel envoie d'email
                    marche.Total_relance = (marche.Total_relance == 0) ? 1 : marche.Total_relance
                    update_reconductionDate(marche, calcul_date_rec(marche).dte, calcul_date_rec(marche).an)
                    res.json({ etat: "ok" })
                }
                else
                res.json({ etat: "dead" })
            }
            else
                res.json({ etat: "notfind" })
        })
    }
}
function mailer(subject, message, to) {
    var mailOptions = {
        from: '"Ne pas repondre (Alerte des Marchés Publics)" <neparepondre.AMP@ville-clichy.fr>', // sender address
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

function Message_texte(marche, i) { //i pour determiner le type de messasge souhaiter i=0 pour les email envoyé au service i=1 pour les email envoyé a la commande publique pour la validation des reconduction i=2 marché reconductible ayant atteint le maximum de reconduction

    var message = ""
    var subject = ""
    var numarche = (marche.NumMarche.toString().length == 1) ? marche.An + "-00" + marche.NumMarche : (marche.NumMarche.toString().length == 2) ? marche.An + "-0" + marche.NumMarche : marche.An + "-" + marche.NumMarche
    var lien = "http://amp.mairie-clichy.fr/marches/" + numarche
    if (i == 0) {
        subject = "Marché " + numarche + " (" + marche.Type_Marche + ")"
        message =
            (marche.Type_Marche == "Ferme") ? "Bonjour, <br>Le marché <b>" + numarche + "</b>, ayant pour objet <b>" + marche.objet + " (voir les détail du marché <a href='" + lien + "'>ici</a>)</b> arrive à échéance le " + "<b>" + marche.D_clot + "</b>.<br>Si vous souhaitez lancer un nouveau marché pour satisfaire  votre besoin,il vous est demandé de contacter la direction de la commande publique sous <b style=\"color: crimson\">un délai de 10 jours </b> afin de planifier la redéfinition de votre besoin.<br>Bien cordialement.<br><br><h2>La Direction de la Commande Publique</h2>"
                : "Bonjour,<br>Les clauses du marché n° <b>" + numarche + "</b>  , ayant pour objet <b>" + marche.objet + " (voir les détail du marché <a href='" + lien + "'>ici</a>)</b>  , notifié le <i>" + marche.Date_debut + "</i> pour une <b>durée initiale de " + marche.D_init / 12 + " ans</b> , prévoient la possibilité de reconduire le marché " + marche.Nbr_reconduction + " fois 1 an.<br>A la date du <b>" + calcul_date_rec(marche).dte + "</b> , nous arrivons à la fin de la <b>" + calcul_date_rec(marche).an + "eme année d'existence</b> du marché.<br>Vous voudrez bien nous faire part de <b>votre position quant à la reconduction ou non de ce marché</b>, soit par retour de mail, soit par contacte téléphonique, au plus tard <b style=\"color: crimson\">sous un délai d'une semaine</b> à compter de la reception du présent courriel<br>Bien cordialement.<br><h2>La Direction de la Commande Publique</h2>"
    }
    else if (i == 1) {
        subject = "Marché " + numarche + " (" + marche.Type_Marche + ") INFORMATION"
        message = (marche.Type_Marche == "Ferme") ? "Bonjour,<br>Le marché <b>" + numarche + "</b>, ayant pour objet <b>" + marche.objet + " (voir les détail du marché <a href='" + lien + "'>ici</a>)</b> arrive à échéance dans un mois jour pour jour.<br>Si un nouveau marché du même type a été lancé nous vous invitons a l'ajouter sur la plateforme AMP."
            : (marche.Type_Marche == "Reconduction tacite") ? "Bonjour,<br>Le marché <b>" + numarche + "</b>, ayant pour objet <b>" + marche.objet + " (voir les détail du marché <a href='" + lien + "'>ici</a>)</b> arrive à échéance dans un mois jour pour jour.<br>Etant un marché de type <b>Reconduction tacite</b>, il est automatiquement relancé pour une duré d'un an sur la plateforme AMP."
                : "Bonjour,<br>Le marché <b>" + numarche + "</b>, ayant pour objet <b>" + marche.objet + "</b> arrive à échéance dans un mois jour pour jour.<br>Ce marché de type <b>Reconduction expresse, a t'il été reconduit? <b><br> <center> <h3><a style=\"color: blue\" href=\"http://amp.mairie-clichy.fr/Marches/reconduire/1/" + marche._id + "\">OUI</a>&nbsp;<a style=\"color: red\" href=\"http://amp.mairie-clichy.fr/Marches/Reconduction/0/" + marche._id + "\">NON</a></h3> </center>."
    }
    else {
        subject = "Marché " + numarche + " (" + marche.Type_Marche + ") INFORMATION"
        message = "Bonjour,<br>Le marché <b>" + numarche + "<b>, ayant pour objet <b>" + marche.objet + " (voir les détail du marché <a href='" + lien + "'>ici</a>)</b> arrive à échéance dans un mois jour pour jour, <b  style=\"color: crimson\">de plus ce marché a atteint le nombre maximum de reconduction définit l'hors de sa création. Par conséquent il ne saurais être reconduit.</b>.<br>Si un nouveau marché du même type a été lancé nous vous invitons a l'ajouter sur la plateforme AMP."
    }
    return { message: message, subject: subject }
}
function calcul_date_rec(marche) {
    //calcul de la date de reconduction courante (cette valeur represente la date a la quel un marché reconductible dois être relancé ou supprimé)
    var nbr_relance = (typeof marche.Total_relance == "undefined" || marche.Total_relance == 0) ? 1 : marche.Total_relance + 1
    var date_recond = new Date(marche.D_clot.substring(3, 5) + "/" + marche.D_clot.substring(0, 2) + "/" + marche.D_clot.substring(6))
    date_recond.setMonth(date_recond.getMonth() - ((marche.D_init / marche.Nbr_reconduction) * (marche.Nbr_reconduction - nbr_relance)))
    var month = String(date_recond.getMonth() + 1);
    var day = String(date_recond.getDate());
    var year = String(date_recond.getFullYear());
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var dte = day + "/" + month + "/" + year;
    if (nbr_relance == 1)// si il s'agit de la première notification de la reconduction on initialise la date courrante de reconduction et le total de reconduction
        update_reconductionDate(marche, dte, 0)
    return { dte: dte, an: nbr_relance }
}
function update_reconductionDate(marche, dte, an) {
    marche.Date_reconduction_courante = dte
    marche.Total_relance = an
    Marches.updateOne({ _id: marche._id }, marche, function (err) {
        if (err)
            console.log('eurreur')
        else
            console.log("date de reconduction actualisé")
    })
}