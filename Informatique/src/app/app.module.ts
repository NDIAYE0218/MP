import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { MatToolbarModule, MatFormFieldModule, MatInputModule,MatExpansionModule,MatProgressBarModule,MatGridListModule, MatOptionModule, MatSelectModule, MatIconModule, MatButtonModule,MatMenuModule, MatCardModule, MatTableModule, MatDividerModule, MatSnackBarModule, MatDatepickerModule,MatNativeDateModule,MAT_DATE_LOCALE,MAT_DATE_FORMATS,MatAutocompleteModule ,MatTabsModule } from '@angular/material';
import { ngfModule } from "angular-file"
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ExcelService} from './excel.service'
import {MarcheService} from './marche.service'
import { FileUploadModule } from 'ng2-file-upload';
import { CookieService } from "angular2-cookie/services/cookies.service";
import { ChartsModule } from 'ng2-charts';
import {ɵROUTER_PROVIDERS} from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import { MarcheComponent } from './compoments/marche/marche.component';
import { MarchesComponent } from './compoments/marches/marches.component';
const routes: Routes = [
  { path: 'marches/:option', component:  MarcheComponent},
  { path: 'marches', component:  MarchesComponent},
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
    MarcheComponent,
    MarchesComponent,
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
  providers: [ɵROUTER_PROVIDERS,{provide: LocationStrategy, useClass: HashLocationStrategy},CookieService,MarcheService,ExcelService,{provide: MAT_DATE_LOCALE, useValue: 'fr'},{ provide: MAT_DATE_FORMATS, useValue: DateFormat }],
  bootstrap: [AppComponent]
})
export class AppModule { }