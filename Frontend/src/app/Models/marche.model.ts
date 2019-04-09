export interface Marches {
    objet           : string,
    An              : string,//2 dernier chiffre de l'année d'enregistrement du marché
    NumMarche       : number,//auto incrementé réinitialisé chaque debut d'année
    Total_relance   : number,//total des notification, aide au calcul de la date des notification
    DateNotific     : string, 
    Nature          : string,
    Type_process    : string, 
    Format_process  : string,
    Type_Marche     : string,
    Montant_Min     : number,//peut être null
    Montant_Max     : number,//peut être null
    MontantConsome :  number,//peut être null
    Nbr_reconduction: number,//aide au calcule de la date de notification
    Observation     : string,
    Date_Cloture_ini: string,//date de cloture initiale
    D_clot          : string,//date de cloture avec modification suceptible de changer en cas de prolongation de la commande
    Contacte        : string,//liste d'email séparé par des virgule (,)
    DG              : string,//direction Générale
    serv            : string,//service
    D_init          : number,//non modifiable
    D_tot           : number,//egal date_ini pour la 1er saisie
    agent_enregist  :string,//email de l'agent enregistrant la demande
    Titulaire       ://information concernant le titulaire
                    {
                        Nom :       string,
                        Adresse_1:  string,
                        Adresse_2:  string,
                        CP:         string,
                        Ville:      string,
                        Tel:        string,
                        Contacte:   string,
                        Mail:       string,
                    },
    Piece_Jointe    :[//liste des piece jointe au marche
                    {
                        numero: number,
                        chemins: string,
                        nom:     string,    
                    }
    ],
    SousTraitants:[//liste sous traitant
        {
                        Numero:     number, 
                        Prestation: string,
                        Nom :       string,
                        Adresse_1:  string,
                        Adresse_2:  string,
                        CP:         string,
                        Ville:      string,
                        Tel:        string,
                        Contacte:   string,
                        Mail:       string,
        }
    ],

    historique      ://details des modification
    [
        {
            numModif: number,
            Montant:  number,
            Prestation:string,
            Autre:    string,
        }
    ],
    Annee          ://details annuels
    [
        {
            valeur : number,
            DRecond: string, 
            DteSS  : string, 
            CourRec: string,
        }
    ],
}