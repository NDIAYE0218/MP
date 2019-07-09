var DirectionGeneral=require('../controleur/DirectionGeneral')
var Services=require('../controleur/Services')
var Contactes=require('../controleur/Contactes')
var Marches=require('../controleur/Marches')
var Marchinf=require('../controleur/MarcheInformatique')
var Users=require('../controleur/Users')
module.exports = function(app) {
    //route des Directions
    app.get('/Directions',DirectionGeneral.listeDirection)
    .post('/Direction',DirectionGeneral.AjouterDirection)
    .delete('/Direction/:Nom',DirectionGeneral.DeleteDG)
    //route des Services 
    .get('/Service/:dir',Services.listeService) //liste services en fonction de la direction
    .get('/Service/:dir/:serv',Services.getServices)
    .post('/Service',Services.AjouterService)
    .delete('/Service/:Nom',Services.DeleteService)
    //route des Contactes
    .get('/Contacte/:serv',Contactes.listeContacte) //liste des contacte en fonction du services
    .get('/Contacte/:serv/:position',Contactes.getContacte)
    .post('/Contacte',Contactes.AjouterContacte)
    .put('/Contacte',Contactes.ModifierContacte)
    //route des Marchés
    .get('/Marches',Marches.listeMarchers)
    .get('/Marche/:num/:an',Marches.getMarcher)
    .post('/Marche',Marches.ajouterMarcher)
    .put('/Marche/:id',Marches.modifierMarcher)
    .delete('/Marches/:num/:an',Marches.supprimerMarcher)
    .get('/Marches/:an',Marches.rechercherMarcher)
    .post('/Marche/upload',Marches.uploderMarche)
    .get('/file_marche/:nomfichier',Marches.downoald_file)
    .post('/Marche/file_marche',Marches.Associer_File_marche)
    //route des connexions
    .get('/Users',Users.GetAll)
    .post('/Users/Connexion',Users.Connexion)
    .post('/Users',Users.AjouterUsers)
    .post('/Users/Forget/:option',Users.Forget)
    .put('/Users',Users.UpdateUser)
    .put('/Users/password',Users.UpdatePassord)
    .delete('/Users/:_id',Users.Delete)
    //route des statistiques
    .get('/Statistiques/:option',Marches.statistiques)
    //route details notification
    .get('/Details/Notification',Marches.getDetailNotification)
    //.post('/Marche/upload',Marches.uploderMarche) //pour l'ajout des marché depuis un fichier CSV ou .xlsx
    //route des statistiques

    //route specifique a l'informatique
    .post('/Informatique/marches',Marchinf.RechercherMarcher)
    .post('/Informatique/marche',Marchinf.ajouterMarcher)
    .put('/Informatique/marche',Marchinf.UpdateMarket)
    .delete('/Informatique/marche/:_id',Marchinf.DeleteMarket)
}