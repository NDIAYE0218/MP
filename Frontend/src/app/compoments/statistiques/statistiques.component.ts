import { Component, OnInit } from '@angular/core';
import { MarcheService } from '../../marche.service'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import swal from 'sweetalert2';
@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.css']
})
export class StatistiquesComponent implements OnInit {
  option = ""
  type = ""
  data_histo = []
  label_histo = []
  data_pie_min = []
  data_pie_max = []
  label_pie = []
  pie_vu = true
  chart_vu = true
  barChartOptions = {};
  pieChartColors = [{backgroundColor: ["#e84351", "#434a54", "#3ebf9b", "#4d86dc", "#f3af37","#00FFFF","#7FFFD4","#5F9EA0","#7FFF00","#D2691E","#FF7F50","#6495ED","#FFF8DC","#B8860B","#FFFF00","#556B2F","#483D8B","#2F4F4F","#00CED1","#B22222","#FFD700","#ADFF2F","#F0E68C","#90EE90","#778899","#800000","#00FA9A","#191970","#808000","#DB7093","#DDA0DD","#008080"," 	#D8BFD8"," 	#EE82EE"]}]
  constructor(private marcheservice: MarcheService, private router: Router, private params: ActivatedRoute) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.option = this.params.snapshot.paramMap.get('option')
        this.type = this.params.snapshot.paramMap.get('type')
        if (this.option == "directions")
          this.findData_finances(0)
        if (this.option == "services")
          this.findData_finances(1)
      }
    })
  }
  ngOnInit() {
    this.option = this.params.snapshot.paramMap.get('option')
    this.type = this.params.snapshot.paramMap.get('type')
    if (this.option == "directions")
      this.findData_finances(0)
    if (this.option == "services")
      this.findData_finances(1)
  }
  findData_finances(option) {
    this.marcheservice.Statistiques(option).subscribe((data: any) => {
      this.label_histo = data.Label
      this.label_pie = data.Label
      this.data_pie_min = data.Montant_min
      this.data_pie_max = data.Montant_max
      this.data_histo=[{data: data.Montant_min, label: "Montant minimun global (HT)€" }, { data: data.Montant_max, label: "Montant maximum global (HT)€" }]
    })
  }
  change_vue(option) {
    if (option) { this.pie_vu = false; this.chart_vu = true }
    else { this.pie_vu = true; this.chart_vu = false }
  }
}
