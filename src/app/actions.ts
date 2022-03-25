import {createAction, props} from '@ngrx/store';
import {IEffect$, INavListItem, IReducer, ISourceFile} from "./models";

export const changeNavListItemsFromOpenDotFile = createAction(
  '[Open Dot File] Change nav list items',
  props<{ navListItems: INavListItem[] }>());

export const changeNavListItemsFromParseProject = createAction(
  '[Parse Project] Change nav list items',
  props<{ navListItems: INavListItem[] }>());

export const changeSrcDotFromCreateDotSrc = createAction(
  '[Create Dot Src] Change dot src',
  props<{ dotSrc: string }>());

export const changeSrcDotFromReadDotSrc = createAction(
  '[Read Dot Src] Change dot src',
  props<{ dotSrc: string }>());

export const changeStatusFromGraphvizComponent = createAction(
  '[Graphviz Component] Change status');

export const changeStatusFromOpenDotFileComponent = createAction(
  '[Open Dot File Component] Change status');

export const changeStatusFromOpenProjectComponent = createAction(
  '[Open Project Component] Change status',
  props<{ projectName: string }>());

export const createDotSrcFromParseProject = createAction(
  '[Parse Project] Create dot src',
  props<{ actions: string[], effects$: IEffect$[], reducers: IReducer[] }>());

export const openSnackBar = createAction(
  '[Effects] Open snackbar',
  props<{ message: string, error: any }>());

export const openSnackBarFromGraphvizComponent = createAction(
  '[Graphviz Component] Open snackbar',
  props<{ message: string, error?: any }>());

export const openSnackBarFromOpenFileComponent = createAction(
  '[Open File Component] Open snackbar',
  props<{ message: string, error?: any }>());

export const openSnackBarFromOpenProjectComponent = createAction(
  '[Open Project Component] Open snackbar',
  props<{ message: string, error?: any }>());

export const parseProjectFromReadProject = createAction(
  '[Read Project] Parse project',
  props<{ sourceFiles: ISourceFile[] }>());

export const readDotFileFromOpenDotFileComponent = createAction(
  '[Open Dot File Component] Read file',
  props<{ file: File }>());

export const readProjectFromOpenProjectComponent = createAction(
  '[Open Project Component] Read project',
  props<{ projectName: string, files: File[] }>());

export const resolveNavListItemsFromOpenDotFile = createAction(
  '[Open Dot File] Resolve nav list items',
  props<{ dotSrc: string }>());

export const resetStatus = createAction(
  '[Effects] Reset status');

export const resetStatusFromGraphvizComponent = createAction(
  '[Graphviz Component] Reset status');

export const resetStatusFromOpenDotFileComponent = createAction(
  '[Open Dot File Component] Reset status');

export const resetStatusFromOpenProjectComponent = createAction(
  '[Open Project Component] Reset status');

export const resolveNavListItemsFromParseProject = createAction(
  '[Parse Project] Resolve nav list items',
  props<{ actions: string[] }>());

export const saveDotFileFromSaveDotFileComponent = createAction(
  '[Save Dot File Component] Save dot file');

export const transitionToNodeFromNavListComponent = createAction(
  '[Nav List Component] Transition to node',
  props<{ id: string }>());
