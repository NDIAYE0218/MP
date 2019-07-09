import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Direction} from '../../Models/directions.model'
import {DirectionService} from '../../direction.service'
@Component({
  selector: 'app-directions',
  templateUrl: './directions.component.html',
  styleUrls: ['./directions.component.css']
})
export class DirectionsComponent implements OnInit {
  directions: Direction[];
  displayedColumns =['NumDG','Nom','actions'];

  constructor(private directionService: DirectionService, private router: Router) { }

  ngOnInit() {
    this.fetchDirection();
  }

  fetchDirection(){
    this.directionService.getDirections().subscribe((data: Direction[])=>{
      this.directions=data;
    })
  }

}
