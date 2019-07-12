var mongoose = require('mongoose');
var MarchesSchema = mongoose.Schema({
    Num_nonExo: String,
    NumMarche: Number,
    An: Number,
    Objet: String,
    Montant: Number,
    DateNotification:String,
    Duree:Number,
    DateFin:String,
    TypeReconduction:String,
    Observation:String,
    DateAlerte: String,
    ActiveAlerte: Number,
    NomTitulaire: String,
    CP: String,
    Adresse: String,
    Mail: String,
    Tel: String
});
module.exports = mongoose.model('MarchesInformatique', MarchesSchema);