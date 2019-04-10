var mongoose = require('mongoose');
var MarchesSchema = mongoose.Schema({
    objet: String,
    An: String,//2 dernier chiffre de l'année d'enregistrement du marché
    NumMarche: Number,//auto incrementé réinitialisé chaque debut d'année
    Total_relance: Number,//total des notification, aide au calcul de la date des notification
    DateNotific: String,
    Nature: String,
    Type_process: String,
    Format_process: String,
    Type_Marche: String,
    Montant_Min: Number,//peut être null
    Montant_Max: Number,//peut être null
    MontantConsome: Number,//peut être null
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
    Titulaire://information concernant le titulaire
    {
        Nom: String,
        Adresse_1: String,
        Adresse_2: String,
        CP: Number,
        Ville: String,
        Tel: String,
        Contacte: String,
        Mail: String,
    },
    SousTraitants: [//liste sous traitant
        {
            Numero: Number,
            Prestation: String,
            Nom: String,
            Adresse_1: String,
            Adresse_2: String,
            CP: String,
            Ville: String,
            Tel: String,
            Contacte: String,
            Mail: String,
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
                Montant: Number,
                Prestation: String,
                Autre: String,
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
});

module.exports = mongoose.model('Marches', MarchesSchema);
