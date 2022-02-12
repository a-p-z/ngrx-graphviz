import {Component} from '@angular/core';
import {
  openSnackBarFromOpenFileComponent,
  readDotFileFromOpenDotFileComponent,
  resetStatusFromOpenDotFileComponent
} from 'src/app/actions';
import {Store} from '@ngrx/store';
import {map, Observable} from "rxjs";
import {selectProjectName, selectStatus} from "../../selectors";

@Component({
  selector: 'app-open-dot-file',
  templateUrl: './app-open-dot-file.component.html',
  styleUrls: ['./app-open-dot-file.component.scss']
})
export class AppOpenDotFileComponent {

  isLoading$?: Observable<boolean>;
  visibility$?: Observable<string>;

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.store.select(selectStatus).pipe(map((status) => status === 'loading'));
    this.visibility$ = this.store.select(selectProjectName).pipe(map((projectName) => !!projectName ? 'hidden' : 'visible'));
  }

  onFileSelected(event$: Event): void {
    event$.preventDefault();
    const target = event$.target as HTMLInputElement;
    if (!target.files || target.files.length !== 1) {
      this.store.dispatch(resetStatusFromOpenDotFileComponent());
      this.store.dispatch(openSnackBarFromOpenFileComponent({message: 'No file selected'}));
      return;
    }

    const file = target.files[0];
    this.store.dispatch(readDotFileFromOpenDotFileComponent({file}));
  }
}
