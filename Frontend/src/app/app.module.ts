import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { MatToolbarModule, MatFormFieldModule, MatInputModule,MatExpansionModule,MatProgressBarModule,MatGridListModule, MatOptionModule, MatSelectModule, MatIconModule, MatButtonModule,MatMenuModule, MatCardModule, MatTableModule, MatDividerModule, MatSnackBarModule, MatDatepickerModule,MatNativeDateModule,MAT_DATE_LOCALE,MAT_DATE_FORMATS,MatAutocompleteModule ,MatTabsModule } from '@angular/material';
import { ngfModule } from "angular-file"
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DirectionsComponent } from './compoments/directions/directions.component';
import { DirectionComponent } from './compoments/direction/direction.component';
import { AjouterDirectionComponent } from './compoments/ajouter-direction/ajouter-direction.component';
import { DirectionService } from './direction.service';
import {UserService} from './user.service'
import {ExcelService} from './excel.service'
import {MarcheService} from './marche.service'
import { MarchesComponent } from './compoments/marches/marches.component';
import { MarcheComponent } from './compoments/marche/marche.component';
import { AjouterMarcheComponent } from './compoments/ajouter-marche/ajouter-marche.component';
import { FileUploadModule } from 'ng2-file-upload';
import { CsvMarcheComponent } from './compoments/csv-marche/csv-marche.component';
import { ConnexionComponent } from './compoments/connexion/connexion.component';
import { AjouterUsersComponent } from './compoments/ajouter-users/ajouter-users.component';
import { UtilisateursComponent } from './compoments/utilisateurs/utilisateurs.component';
import { ForgetPasswordComponent } from './compoments/forget-password/forget-password.component';
import { CookieService } from "angular2-cookie/services/cookies.service";
import { ReconductionComponent } from './compoments/reconduction/reconduction.component';
import { StatistiquesComponent } from './compoments/statistiques/statistiques.component';
import { ChartsModule } from 'ng2-charts';
import { AvenantComponent } from './compoments/avenant/avenant.component';
import {ɵROUTER_PROVIDERS} from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import { TableauDonneesEsentielsComponent } from './compoments/tableau-donnees-esentiels/tableau-donnees-esentiels.component';
const routes: Routes = [
  { path: 'marches/:id', component: MarcheComponent },
  { path: 'marches/avenant/:id', component: AvenantComponent },
  { path: 'direction/ajouter', component: AjouterDirectionComponent },
  { path: 'marche/ajouter', component: AjouterMarcheComponent },
  { path: 'marche/ajouter/csv', component: CsvMarcheComponent },
  { path: 'utilisateur', component: UtilisateursComponent },
  { path: 'utilisateur/ajout', component: AjouterUsersComponent },
  { path: 'Reinitialisation/:crypto', component: ForgetPasswordComponent },
  { path: 'marches', component: MarchesComponent },
  { path: 'Connexion', component: ConnexionComponent },
  { path: 'Marches/reconduire/:rep/:_id', component: ReconductionComponent },
  { path: 'Statistiques/:type/:option', component: StatistiquesComponent },
  { path: 'ddd', component: TableauDonneesEsentielsComponent },
  { path: '', redirectTo: 'Connexion', pathMatch: 'full' }
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
    AjouterUsersComponent,
    UtilisateursComponent,
    ForgetPasswordComponent,
    ReconductionComponent,
    StatistiquesComponent,
    AvenantComponent,
    TableauDonneesEsentielsComponent,
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
    ngfModule,
    ChartsModule
  ],
  providers: [ɵROUTER_PROVIDERS,{provide: LocationStrategy, useClass: HashLocationStrategy},CookieService,DirectionService,MarcheService,UserService,ExcelService,{provide: MAT_DATE_LOCALE, useValue: 'fr'},{ provide: MAT_DATE_FORMATS, useValue: DateFormat }],
  bootstrap: [AppComponent]
})
export class AppModule { }