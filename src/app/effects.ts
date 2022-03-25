import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {
  changeNavListItemsFromOpenDotFile,
  changeNavListItemsFromParseProject,
  changeSrcDotFromCreateDotSrc,
  changeSrcDotFromReadDotSrc,
  createDotSrcFromParseProject,
  openSnackBar,
  openSnackBarFromGraphvizComponent,
  openSnackBarFromOpenFileComponent,
  openSnackBarFromOpenProjectComponent,
  parseProjectFromReadProject,
  readDotFileFromOpenDotFileComponent,
  readProjectFromOpenProjectComponent,
  resetStatus,
  resolveNavListItemsFromOpenDotFile,
  resolveNavListItemsFromParseProject,
  saveDotFileFromSaveDotFileComponent,
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
      ofType(createDotSrcFromParseProject.type),
      map(({actions, effects$, reducers}) => this.dotFileParser.createDotSrc(actions, effects$, reducers)),
      map((dotSrc) => changeSrcDotFromCreateDotSrc({dotSrc})),
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

  parseProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(parseProjectFromReadProject.type),
      map(({sourceFiles}: { sourceFiles: ISourceFile[] }) => sourceFiles.filter(({path}) => path.endsWith("tsconfig.json"))[0]),
      map(({path}) => this.projectParser.parse(path)),
      switchMap((props) => [
        createDotSrcFromParseProject(props),
        resolveNavListItemsFromParseProject({actions: props.actions})]),
      catchError((error) => [
        openSnackBar({message: 'Error analyzing project', error}),
        resetStatus()]));
  });

  readDotFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(readDotFileFromOpenDotFileComponent.type),
      mergeMap(({file}) => this.textFileReader.read(file)),
      switchMap((dotSrc) => [
        changeSrcDotFromReadDotSrc({dotSrc}),
        resolveNavListItemsFromOpenDotFile({dotSrc})]),
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
      map((sourceFiles) => parseProjectFromReadProject({sourceFiles})),
      catchError((error) => [
        openSnackBar({message: 'Error reading project', error}),
        resetStatus()]));
  });

  resolveNavListItemsFromOpenDotFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(resolveNavListItemsFromOpenDotFile.type),
      map(({dotSrc}) => this.dotFileParser.getNavListItemsFromDotSrc(dotSrc)),
      map((navListItems) => changeNavListItemsFromOpenDotFile({navListItems})),
      catchError((error) => [
        openSnackBar({message: 'Error extracting actions from dot file', error}),
        resetStatus()]));
  });

  resolveNavListItemsFromOpenProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(resolveNavListItemsFromParseProject.type),
      map(({actions}) => this.dotFileParser.getNavListItemsFromActions(actions)),
      map((navListItems) => changeNavListItemsFromParseProject({navListItems})),
      catchError((error) => [
        openSnackBar({message: 'Error creating nav list items', error}),
        resetStatus()]));
  });

  saveDotFile$ = createEffect(() => {
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
