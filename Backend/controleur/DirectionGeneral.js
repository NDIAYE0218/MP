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
        var nouvelDirection = new DirectionGeneral(req.body)
        nouvelDirection.save(function 
            (err) {
            if (err)
                throw err
        })

    }

}