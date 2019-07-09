var mongoose = require('mongoose');
var MarchesSchema = mongoose.Schema({
    Num_nonExo: String,
    NumMarche: Number,
    An: Number,
    objet: String,
    Montant: Number,
    DateNotification:String,
    Duree:Number,
    DateFin:String,
    TypeReconduction:String,
    Observation:String,
    DateAlerte: String,
    Titulaire:{
        Nom: String,
        CP: String,
        Adresse: String,
        Mail: String,
        Montant: Number,
        Numero: String
    }
});
module.exports = mongoose.model('MarchesInformatique', MarchesSchema);