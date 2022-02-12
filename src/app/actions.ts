import {createAction, props} from '@ngrx/store';
import {IEffect$, INavListItem, IReducer, ISourceFile} from "./models";

export const createDotSrc = createAction(
  '[Effects] Create dot src',
  props<{ actions: string[], effects$: IEffect$[], reducers: IReducer[] }>());

export const createDotSrcSucceeded = createAction(
  '[Effects] Create dot src succeeded',
  props<{ dotSrc: string }>());

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

export const readDotFileFromOpenDotFileComponent = createAction(
  '[Open Dot File Component] Read file',
  props<{ file: File }>());

export const readDotFileSucceeded = createAction(
  '[Effects] Read dot file succeeded',
  props<{ dotSrc: string }>());

export const readProjectFromOpenProjectComponent = createAction(
  '[Open Project Component] Read project',
  props<{ projectName: string, files: File[] }>());

export const readProjectSucceeded = createAction(
  '[Effects] Read project succeeded',
  props<{ sourceFiles: ISourceFile[] }>());

export const renderSucceededFromGraphvizComponent = createAction(
  '[Graphviz Component] Render succeeded');

export const resolveNavListItemsSucceeded = createAction(
  '[Effects] Resolve nav list items succeeded',
  props<{ navListItems: INavListItem[] }>());

export const saveDotFileFromSaveDotFileComponent = createAction(
  '[Save Dot File Component] Save dot file');

export const transitionToNodeFromNavListComponent = createAction(
  '[Nav List Component] Transition to node',
  props<{ id: string }>());

export const resetStatus = createAction(
  '[Effects] Reset status');

export const resetStatusFromGraphvizComponent = createAction(
  '[Graphviz Component] Reset status');

export const resetStatusFromOpenDotFileComponent = createAction(
  '[Open Dot File Component] Reset status');

export const resetStatusFromOpenProjectComponent = createAction(
  '[Open Project Component] Reset status');
