var mongoose = require('mongoose');
var Services = mongoose.Schema({
NumServ         : Number,    
NomDG           : String, //Num Direction Générale
Nom             : String
});
module.exports = mongoose.model('Services', Services);