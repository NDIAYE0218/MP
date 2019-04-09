var Contactes= require('../app/models/Contactes')
module.exports = {
    listeContacte: function(req,res){       
        Contactes.find({"NumServ": req.params.serv}, function (err, contacts) {
            if (err)
                throw err
            res.json(contacts)
        }).sort({ _id: 1 })
    },
    getContacte: function(req,res){

    },
    AjouterContacte: function(req,res){
    var nouveauContact= new Contactes(req.body)
    nouveauContact.save(function 
        (err) {
        if (err)
            throw err
    })
    },
    ModifierContacte: function(req,res){
        
    }
}