var mongoose = require('mongoose');
var DirectionGeneralSchema = mongoose.Schema({
NumDG           : Number, //Num Direction Générale
Nom             : String
});
module.exports = mongoose.model('DirectionGeneral', DirectionGeneralSchema);