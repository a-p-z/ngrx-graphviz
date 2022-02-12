import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {selectNavListItems} from "src/app/selectors";
import {transitionToNodeFromNavListComponent} from "src/app/actions";
import {INavListItem} from "../../models";

@Component({
  selector: 'app-nav-list',
  templateUrl: './app-nav-list.component.html',
  styleUrls: ['./app-nav-list.component.scss']
})
export class AppNavListComponent implements OnInit {
  filterText = '';
  navListItems$?: Observable<INavListItem[]>;

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.navListItems$ = this.store.select(selectNavListItems);
  }

  transitionToNode({id}: { id: string }): void {
    this.store.dispatch(transitionToNodeFromNavListComponent({id}));
  }
}
