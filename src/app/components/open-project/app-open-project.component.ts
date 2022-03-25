import {Component, ElementRef, ViewChild} from "@angular/core";
import {
  changeStatusFromOpenProjectComponent,
  openSnackBarFromOpenProjectComponent,
  readProjectFromOpenProjectComponent,
  resetStatusFromOpenProjectComponent,
} from "src/app/actions";
import {Store} from "@ngrx/store";
import {map, Observable, withLatestFrom} from "rxjs";
import {selectProjectName, selectStatus} from "../../selectors";

@Component({
  selector: "app-open-project",
  templateUrl: "./app-open-project.component.html",
  styleUrls: ["./app-open-project.component.scss"]
})
export class AppOpenProjectComponent {

  @ViewChild("input", {static: false}) input?: ElementRef;

  isLoading$?: Observable<boolean>;
  visibility$?: Observable<string>;

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.store.select(selectStatus).pipe(map((status) => status === "loading"));
    this.visibility$ = this.store.select(selectProjectName).pipe(
      withLatestFrom(this.store.select(selectStatus)),
      map(([projectName, status]) => !projectName && status === "loading" ? "hidden" : "visible"));
  }

  onProjectSelected(event$: Event): void {
    event$.preventDefault();
    const target = event$.target as HTMLInputElement;
    if (!target.files) {
      this.store.dispatch(resetStatusFromOpenProjectComponent());
      this.store.dispatch(openSnackBarFromOpenProjectComponent({message: 'No files selected'}));
      return;
    }

    const projectName = target.files[0].webkitRelativePath.split('/')[0];

    const files = Array.from(target.files)
      .filter(({webkitRelativePath}) => this.filterFolders(webkitRelativePath, "src/", "node_modules/@ngrx/store/", "node_modules/@ngrx/effects/"))
      .filter(({name}) => this.endsWith(name, ".ts", "tsconfig.json"))
      .filter(({name}) => this.notEndsWith(name, ".spec.ts"));

    const tsconfigNotFound = files.every(({webkitRelativePath}) => webkitRelativePath !== `${projectName}/tsconfig.json`);

    if (tsconfigNotFound) {
      this.store.dispatch(resetStatusFromOpenProjectComponent());
      this.store.dispatch(openSnackBarFromOpenProjectComponent({message: 'tsconfing.json not found'}));
      return;
    }

    this.store.dispatch(readProjectFromOpenProjectComponent({projectName, files}));
    this.store.dispatch(changeStatusFromOpenProjectComponent({projectName}));
  }

  private endsWith(name: string, ...extensions: string[]): boolean {
    const lowerCaseName = name.toLowerCase();
    return extensions.some((extension) => lowerCaseName.endsWith(extension));
  }

  private notEndsWith(name: string, ...extensions: string[]): boolean {
    const lowerCaseName = name.toLowerCase();
    return extensions.every((extension) => !lowerCaseName.endsWith(extension));
  }

  private filterFolders(webkitRelativePath: string, ...args: string[]): boolean {
    const split = webkitRelativePath.split('/').slice(1);
    const relativePath = split.join('/');
    return split.length === 1 || args.some((arg) => relativePath.startsWith(arg));
  }
}
