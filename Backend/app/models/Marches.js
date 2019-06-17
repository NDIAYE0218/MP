var mongoose = require('mongoose');
var MarchesSchema = mongoose.Schema({
    objet: String,
    An: String,//2 dernier chiffre de l'année d'enregistrement du marché
    NumMarche: Number,//auto incrementé réinitialisé chaque debut d'année
    Total_relance: Number,//total des notification, aide au calcul de la date des notification
    DateNotific: String,
    Datecreation: String,
    Nature: String,
    Type_process: String,
    Format_process: String,
    Type_Marche: String,
    Montant_Min_HT_ini: Number,//peut être null
    Montant_Max_HT_ini: Number,//peut être null
    Montant_Min_TTC_ini: Number,//peut être null
    Montant_Max_TTC_ini: Number,//peut être null
    Montant_Min_HT_glob: Number,//peut être null
    Montant_Max_HT_glob: Number,//peut être null
    Montant_Min_TTC_glob: Number,//peut être null
    Montant_Max_TTC_glob: Number,//peut être null
    Nbr_reconduction: Number,//aide au calcule de la date de notification
    Observation: String,
    Date_Cloture_ini: String,//date de cloture initiale
    Date_debut: String,//date de debut du contrat
    D_clot: String,//date de cloture avec modification suceptible de changer en cas de prolongation de la commande
    Contacte: String,//liste d'email séparé par des virgule (,)
    DG: String,//direction Générale
    serv: String,//service
    D_init: Number,//non modifiable
    D_tot: Number,//egal date_ini pour la 1er saisie
    agent_enregist: String,//email de l'agent enregistrant la demande
    Date_reconduction_courante: String,
    Tot_rec_effectue: String,
    bloque: Number, //permet de bloquer l'actualisation d'une reconduction expresse, si 1 l'on ne peut plus actualiser la decision
    Titulaire:
    [
       { Nom: String,
        Adresse: String,
        Mail: String,
        Montant: Number,
        SousTraitants: [//liste sous traitant
            {
                Nom: String,
                Adresse: String,
                Mail: String,
                Montant: Number,
            }
        ]
       }
    ],
    Piece_Jointe: [//liste des piece jointe au marche
        {
            numero: Number,
            chemins: String,
            nom: String,
        }
    ],
    historique://details des modification
        [
            {
                numModif: Number,
                Objet:String,
                Montant: Number,
                Resume: String,
                auteur: String,
                date: String
            }
        ],
    Annee://details annuels
        [
            {
                valeur: Number,
                DRecond: String,
                DteSS: String,
                CourRec: String,
            }
        ],
    Tranche_optionnel:
    [
        {
            condition:String,
            Observation:String,
            Montant:Number,
            auteur: String,
            date: String
        }
    ]
});
module.exports = mongoose.model('Marches', MarchesSchema);
