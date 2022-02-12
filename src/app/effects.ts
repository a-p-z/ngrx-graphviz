import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {
  createDotSrc,
  createDotSrcSucceeded,
  openSnackBar,
  openSnackBarFromGraphvizComponent,
  openSnackBarFromOpenFileComponent,
  openSnackBarFromOpenProjectComponent,
  readDotFileFromOpenDotFileComponent,
  readDotFileSucceeded,
  readProjectFromOpenProjectComponent,
  readProjectSucceeded,
  resetStatus,
  resolveNavListItemsSucceeded,
  saveDotFileFromSaveDotFileComponent
} from "./actions";
import {catchError, filter, forkJoin, map, mergeMap, switchMap, tap, withLatestFrom} from "rxjs";
import {TextFileReader} from "./core/text-file-reader";
import {DotFileParser} from "./core/dot-file-parser";
import {ProjectParser} from "./core/project-parser";
import {ISourceFile} from "./models";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Store} from "@ngrx/store";
import {selectDotSrc, selectProjectName} from "./selectors";

@Injectable()
export class GraphvizEffects {

  constructor(private actions$: Actions,
              private document: Document,
              private dotFileParser: DotFileParser,
              private projectParser: ProjectParser,
              private snackBar: MatSnackBar,
              private store: Store,
              private textFileReader: TextFileReader) {
  }

  createDotSrc$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createDotSrc.type),
      map(({actions, effects$, reducers}) => this.dotFileParser.createDotSrc(actions, effects$, reducers)),
      map((dotSrc) => createDotSrcSucceeded({dotSrc})),
      catchError((error) => [
        openSnackBar({message: 'Error creating dot src', error}),
        resetStatus()]));
  });

  openSnackBar$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(
          openSnackBar.type,
          openSnackBarFromGraphvizComponent.type,
          openSnackBarFromOpenFileComponent.type,
          openSnackBarFromOpenProjectComponent.type),
        map(({message, error}) => !!error ? `${message}: ${error}` : message),
        tap((message) => console.error(message)),
        tap((message) => this.snackBar.open(message)));
    },
    {dispatch: false});

  readDotFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(readDotFileFromOpenDotFileComponent.type),
      mergeMap(({file}) => this.textFileReader.read(file)),
      map((dotSrc) => readDotFileSucceeded({dotSrc})),
      catchError((error) => [
        openSnackBar({message: 'Error reading dot file', error}),
        resetStatus()]));
  });

  readProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(readProjectFromOpenProjectComponent.type),
      switchMap(({files}: { files: File[] }) => forkJoin(files
        .map((file: File) => this.textFileReader.read(file).pipe(
          map((text) => this.projectParser.createSourceFile(file.webkitRelativePath, text)))))),
      map((sourceFiles) => readProjectSucceeded({sourceFiles})),
      catchError((error) => [
        openSnackBar({message: 'Error reading project', error}),
        resetStatus()]));
  });

  readProjectSucceeded$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(readProjectSucceeded.type),
      map(({sourceFiles}: { sourceFiles: ISourceFile[] }) => sourceFiles.filter(({path}) => path.endsWith("tsconfig.json"))[0]),
      map(({path}) => this.projectParser.parse(path)),
      map((props) => createDotSrc(props)),
      catchError((error) => [
        openSnackBar({message: 'Error analyzing project', error}),
        resetStatus()]));
  });

  resolveNavListItemsFromActions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createDotSrc.type),
      map(({actions}) => this.dotFileParser.getNavListItemsFromActions(actions)),
      map((navListItems) => resolveNavListItemsSucceeded({navListItems})),
      catchError((error) => [
        openSnackBar({message: 'Error creating nav list items', error}),
        resetStatus()]));
  });

  resolveNavListItemsFromDotSrc$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(readDotFileSucceeded.type),
      map(({dotSrc}) => this.dotFileParser.getNavListItemsFromDotSrc(dotSrc)),
      map((navListItems) => resolveNavListItemsSucceeded({navListItems})),
      catchError((error) => [
        openSnackBar({message: 'Error extracting actions from dot file', error}),
        resetStatus()]));
  });

  saveDotFileFromSaveDotFileComponent$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(saveDotFileFromSaveDotFileComponent.type),
        withLatestFrom(this.store.select(selectProjectName), this.store.select(selectDotSrc)),
        filter(([, , dotSrc]) => !!dotSrc),
        tap(([, projectName, dotSrc]) => {
          const a = this.document.createElement('a');
          a.download = `${projectName}.dot`;
          a.href = URL.createObjectURL(new Blob([dotSrc as string], {type: 'text/plain'}));
          a.click();
        }));
    },
    {dispatch: false});
}
