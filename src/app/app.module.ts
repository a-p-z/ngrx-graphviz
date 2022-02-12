import {AngularResizeEventModule} from 'angular-resize-event';
import {AppComponent} from 'src/app/app.component';
import {AppGraphvizComponent} from 'src/app/components/graphviz/app-graphviz.component';
import {AppNavListComponent} from "./components/nav-list/app-nav-list.component";
import {AppOpenDotFileComponent} from 'src/app/components/open-dot-file/app-open-dot-file.component';
import {AppOpenProjectComponent} from 'src/app/components/open-project/app-open-project.component';
import {AppSaveDotFileComponent} from "./components/save-dot-file/app-save-dot-file.component";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule, DomSanitizer} from '@angular/platform-browser';
import {DotFileParser} from "./core/dot-file-parser";
import {EffectsModule} from '@ngrx/effects';
import {FilterPipe} from 'src/app/pipes/filter.pipe';
import {FormsModule} from '@angular/forms';
import {GraphvizEffects} from "./effects";
import {HighlightPipe} from 'src/app/pipes/highlight.pipe';
import {HttpClientModule} from "@angular/common/http";
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button'
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule, MatIconRegistry} from "@angular/material/icon";
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {NgModule} from '@angular/core';
import {ProjectParser} from "./core/project-parser";
import {StoreModule} from '@ngrx/store';
import {TextFileReader} from "./core/text-file-reader";
import {reducer} from 'src/app/reducer';

@NgModule({
  declarations: [
    AppComponent,
    AppGraphvizComponent,
    AppNavListComponent,
    AppOpenDotFileComponent,
    AppOpenProjectComponent,
    AppSaveDotFileComponent,
    FilterPipe,
    HighlightPipe
  ],
  imports: [
    AngularResizeEventModule,
    BrowserAnimationsModule,
    BrowserModule,
    EffectsModule.forRoot([GraphvizEffects]),
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    StoreModule.forRoot({graphviz: reducer}, {})
  ],
  providers: [
    DotFileParser,
    ProjectParser,
    TextFileReader,
    {provide: Document, useValue: document},
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {duration: 2500, panelClass: ['mat-toolbar', 'mat-warn'], verticalPosition: 'top'}
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry) {
    this.matIconRegistry.addSvgIcon('dot_file', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/dot-file.svg'));
    this.matIconRegistry.addSvgIcon('ngrx_project', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/ngrx-project.svg'));
  }
}
