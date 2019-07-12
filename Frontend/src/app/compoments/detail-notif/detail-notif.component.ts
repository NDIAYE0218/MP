import { Component, OnInit } from '@angular/core';
import { MarcheService } from '../../marche.service'
@Component({
  selector: 'app-detail-notif',
  templateUrl: './detail-notif.component.html',
  styleUrls: ['./detail-notif.component.css']
})
export class DetailNotifComponent implements OnInit {
  marches = []
  ColumnsDates = ['NumMarche', 'objet', 'dte_not', 'dte_deb', 'dte_cre', 'dte_clo', 'duree', 'tot_recond', 'duree_total', 'act']

  constructor(private marcheservice: MarcheService) { }
  ngOnInit() {
    this.marcheservice.getNotif().subscribe((data: any) => {
      this.marches = data
    })
  }
  getDate(dte) {
    if (typeof dte != 'undefined') {
      if (dte.includes("$$"))
        var event = new Date(dte.split('$$')[0])
      else
        var event = new Date(dte.split('/')[2] + "-" + dte.split('/')[1] + "-" + dte.split('/')[0])
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return event.toLocaleDateString('fr-FR', options)
    }
    else
      return "date non definit"
  }
  
}
