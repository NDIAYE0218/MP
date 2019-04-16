var Users = require('../app/models/Users')
const nodemailer = require("nodemailer")
var transporter = nodemailer.createTransport('smtp://webmail.ville-clichy.fr/') //smtp du webmail de la ville
module.exports = {
    AjouterUsers: function (req, res) {
        var user = new Users(req.body)
        Users.findOne({ Email: req.body.Email }, function (err, users) {
            if (err)
                console.log("erreur verification unicité email")
            else {
                if (users == null) {
                    user.save(function
                        (err) {
                        if (err)
                            console.log("erreur d'ajout utilisateur")
                        else
                            res.json({ etat: "success" })
                    })
                }
            else
                res.json({etat:"existant"})
            }
        })

    },
    Forget: function (req, res) {
        var recherche = req.body
        var option = parseInt(req.params.option)
        Users.findOne(recherche, function (err, users) {
            if (err)
                console.log("erreur Forget")
            else {
                if (users == null)
                    res.json({ etat: "inconnue" })
                else {
                    users.Crypto = generatecrypto(150)
                    sendmail(users.Email, users.Crypto, option)
                    Users.updateOne({
                        _id: users._id
                    }, users, function (err) {
                        if (err)
                            console.log('eurreur modification du crypto')
                    }
                    )
                    res.json({ etat: "ok" })
                }
            }
        })
    },
    UpdateUser: function (req, res) {
        user = req.body
        Users.updateOne({ _id: user._id, }, user, function (err,user) {
            if (err)
                console.log('eurreur modification users')
            else
            res.json(user)
        }
        )
    },
    UpdatePassord: function (req, res) {
        Users.findOne({ Email: req.body.Email, Crypto: req.body.Crypto }, function (err, users) {
            if (err)
                console.log("EURREUR de modification password")
            else {
                if (users == null)
                    res.json({ etat: "dead" })
                else {
                    users.MDP = req.body.MDP
                    Users.updateOne({ _id: users._id }, users, function (err) {
                        if (err)
                            console.log('eurreur modification mot de passe crypto asurer')
                    }
                    )
                    res.json({ etat: "ok" })
                }
            }
        })
    },
    Connexion: function (req, res) {
        Users.findOne(req.body, function (err, users) {
            if (err)
                console.log("erreur de connexion")
            else
                res.json(users)
        })
    }
}
function sendmail(to, crypto, option) {
    var etat = (option == 0) ? " nouvelle inscription " : " demande de renouvellement "
    var lien = "http://localhost:4200/" + crypto
    var message = "<h2>Bonjour, <br>Suite a votre" + etat + "veuillez cliquer <a href=\"" + lien + "\">ici</a> pour creer un nouveau mot de passe.</h2>"
    var mailOptions = {
        from: '"Ne pas repondre (Alerte des Marchés Publics)" <neparepondre.AMP@ville-clichy.fr>', // sender address
        to: to, // list of receivers
        subject: "Nouveau mot de passe AMP", // Subject line
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
function generatecrypto(length) {
    var text = "";
    var possible = "azertyuiopmlkjhgfdsqwxcvbnNBVCXWQSDFGHJKLMPOIUYTREZA1478852369azertyuiopmlkjhgfdsqwxcvbnNBVCXWQSDFGHJKLMPOIUYTREZA1478852369";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}