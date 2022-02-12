import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectProjectName, selectStatus} from 'src/app/selectors';
import {map, Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isLoading$?: Observable<boolean>;
  isLoaded$?: Observable<boolean>;
  modeProject$?: Observable<boolean>;

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.store.select(selectStatus).pipe(map((status) => status === 'loading'));
    this.isLoaded$ = this.store.select(selectStatus).pipe(map((status) => status === 'loaded'));
    this.modeProject$ = this.store.select(selectProjectName).pipe(map((projectName) => !!projectName));
  }
}
