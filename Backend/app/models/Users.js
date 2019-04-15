var mongoose = require('mongoose');
var Users = mongoose.Schema({
    Nom: String,
    Prenom: String,
    Poste: String,
    Email: String,
    MDP:   String,
    Crypto:String, //chaine permettant de generer les liens, chaine renouvellé a chaque renouvellement de mot de passe
    Droit: Number, //droit=0 ==> ajouter marché, droit=1 ==> ajouter et modifier marché, droit=2 ==> ajouter, modifier et supprimer marché
});
module.exports = mongoose.model('Users', Users);