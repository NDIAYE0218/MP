var DirectionGeneral = require('../app/models/DirectionGeneral')
module.exports = {
    listeDirection: function (req, res) {
        DirectionGeneral.find({}, function (err, directions) {
            if (err)
                throw err
            res.json(directions)
        }).sort({ _id: 1 })

    },
    AjouterDirection: function (req, res) {
        DirectionGeneral.find({}, function (err, directions) {
            var NumDG=directions.length+1
            req.body.NumDG=NumDG
            var nouvelDirection = new DirectionGeneral(req.body)
            nouvelDirection.save(function (err) {
                if (err)
                    throw err
                else
                res.json('ok')
            })
        })
        },
    DeleteDG: function(req,res){
        DirectionGeneral.deleteOne({Nom:req.params.Nom},function(err){
            if(err)
            console.log(err)
            else
            res.json('ok')
        })
    }
}