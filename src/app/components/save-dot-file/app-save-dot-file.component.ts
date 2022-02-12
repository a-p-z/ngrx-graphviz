import {Component} from "@angular/core";
import {Store} from "@ngrx/store";
import {saveDotFileFromSaveDotFileComponent} from "../../actions";

@Component({
  selector: 'app-save-dot-file',
  templateUrl: './app-save-dot-file.component.html',
  styleUrls: ['./app-save-dot-file.component.scss']
})
export class AppSaveDotFileComponent {

  constructor(private store: Store) {
  }

  onClick(event$: Event): void {
    event$.preventDefault();
    this.store.dispatch(saveDotFileFromSaveDotFileComponent());
  }
}
