import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { MatToolbarModule, MatFormFieldModule, MatInputModule,MatExpansionModule,MatProgressBarModule,MatGridListModule, MatOptionModule, MatSelectModule, MatIconModule, MatButtonModule,MatMenuModule, MatCardModule, MatTableModule, MatDividerModule, MatSnackBarModule, MatDatepickerModule,MatNativeDateModule,MAT_DATE_LOCALE,MAT_DATE_FORMATS,MatAutocompleteModule ,MatTabsModule } from '@angular/material';
import { ngfModule, ngf } from "angular-file"
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DirectionsComponent } from './compoments/directions/directions.component';
import { DirectionComponent } from './compoments/direction/direction.component';
import { AjouterDirectionComponent } from './compoments/ajouter-direction/ajouter-direction.component';
import { DirectionService } from './direction.service';
import {MarcheService} from './marche.service'
import { MarchesComponent } from './compoments/marches/marches.component';
import { MarcheComponent } from './compoments/marche/marche.component';
import { AjouterMarcheComponent } from './compoments/ajouter-marche/ajouter-marche.component';
import { FileUploadModule } from 'ng2-file-upload';
import { CsvMarcheComponent } from './compoments/csv-marche/csv-marche.component';
import { ConnexionComponent } from './compoments/connexion/connexion.component';
const routes: Routes = [
  { path: 'marches/:id', component: MarcheComponent },
  { path: 'direction/ajouter', component: AjouterDirectionComponent },
  { path: 'marche/ajouter', component: AjouterMarcheComponent },
  { path: 'marche/ajouter/csv', component: CsvMarcheComponent },
  { path: 'marches', component: MarchesComponent },
  { path: '', redirectTo: 'marches', pathMatch: 'full' }
];

const DateFormat = {
  parse: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' }
},
display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
}
};
@NgModule({
  declarations: [
    AppComponent,
    DirectionsComponent,
    DirectionComponent,
    AjouterDirectionComponent,
    MarchesComponent,
    MarcheComponent,
    AjouterMarcheComponent,
    CsvMarcheComponent,
    ConnexionComponent,

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatTabsModule,
    FormsModule,
    MatGridListModule,
    MatExpansionModule,
    FileUploadModule,
    MatProgressBarModule,
    ngfModule
  ],
  providers: [DirectionService,MarcheService,{provide: MAT_DATE_LOCALE, useValue: 'fr'},{ provide: MAT_DATE_FORMATS, useValue: DateFormat }],
  bootstrap: [AppComponent]
})
export class AppModule { }