var mongoose = require('mongoose');
var Contactes = mongoose.Schema({
NumServ         : Number,
Nom             : String,
Prenom          : String,
Email           : String
});
module.exports = mongoose.model('Contactes', Contactes);