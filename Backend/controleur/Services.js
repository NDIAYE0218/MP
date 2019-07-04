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
        Services.find({}, function (err, services) {
        req.body.NumServ=services.length+1
        var nouveauService= new Services(req.body)
        nouveauService.save(function 
            (err) {
            if (err)
                throw err
            else
            res.json('ok')
        })
    })
    },
    DeleteService: function(req,res){
        Services.deleteOne({Nom:req.params.Nom},function(err){
            if(err)
            console.log(err)
            else
            res.json('ok')
        })
    }
}