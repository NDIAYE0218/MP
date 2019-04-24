var express = require('express');
var bp = require('body-parser');
var schedule = require('node-schedule');
var app = express();
var port = process.env.PORT || 4000;
var mongoose = require('mongoose');
var fileupload = require("express-fileupload");
var notification = require('./config/mailer_process') //contient les fonctions qui scrutte la BD et envoie les emails de notification
app.use(fileupload());
configDB = require('./config/connexionMongo');
mongoose.connect(configDB.url, { useNewUrlParser: true });
mongoose.connection.once('open', () => {
  console.log('Connexion a la BD MarchePublic établie');
});
//midleware d'autorisation du domaine du front
app.use(function (req, res, next) {
 //res.header("Access-Control-Allow-Origin", "http://amp.ville-clichy.fr:4200");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
var j = schedule.scheduleJob('00 23 14 * * *',notification.Scrutteur_Notification);//lancement du process de notification
app.get("/Marches/reconduire/:_id",notification.Reconduction_expresse) //chemin exeptionnel pour la reconduction d'un marché express
app.use(bp.json())
require('./app/routes')(app);
app.listen(port);
console.log('Le service Backend a démaré sur le port: ' + port);