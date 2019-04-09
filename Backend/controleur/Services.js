var Services= require('../app/models/Services')
module.exports = {
    listeService: function(req,res){
        Services.find({"NomDG": req.params.dir}, function (err, services) {
            if (err)
                throw err
            res.json(services)
        }).sort({ _id: 1 })
    },
    getServices: function(req,res){

    },
    AjouterService: function(req,res){
        var nouveauService= new Services(req.body)
        nouveauService.save(function 
            (err) {
            if (err)
                throw err
        })
    }
}