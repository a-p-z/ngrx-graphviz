import {createReducer, on} from '@ngrx/store';
import {
  changeNavListItemsFromOpenDotFile,
  changeNavListItemsFromParseProject,
  changeSrcDotFromCreateDotSrc,
  changeSrcDotFromReadDotSrc,
  changeStatusFromGraphvizComponent,
  changeStatusFromOpenDotFileComponent,
  changeStatusFromOpenProjectComponent,
  resetStatus,
  resetStatusFromGraphvizComponent,
  resetStatusFromOpenDotFileComponent,
  resetStatusFromOpenProjectComponent,
} from 'src/app/actions';
import {INavListItem} from "./models";

export interface GraphvizState {
  status?: 'loading' | 'loaded';
  projectName?: string;
  navListItems: INavListItem[];
  dotSrc?: string;
}

const initialState: GraphvizState = {
  status: undefined,
  projectName: undefined,
  navListItems: [],
  dotSrc: undefined
};

const _graphvizReducer = createReducer(
  initialState,
  on(changeNavListItemsFromOpenDotFile, changeNavListItemsFromParseProject, (state, {navListItems}) => {
    return {...state, navListItems};
  }),
  on(changeSrcDotFromCreateDotSrc, changeSrcDotFromReadDotSrc, (state, {dotSrc}) => {
    return {...state, dotSrc};
  }),
  on(changeStatusFromGraphvizComponent, (state) => {
    return {...state, status: 'loaded'};
  }),
  on(changeStatusFromOpenDotFileComponent, (state) => {
    return {...state, status: 'loading'};
  }),
  on(changeStatusFromOpenProjectComponent, (state, {projectName}) => {
    return {...state, status: 'loading', projectName};
  }),
  on(resetStatus,
    resetStatusFromGraphvizComponent,
    resetStatusFromOpenDotFileComponent,
    resetStatusFromOpenProjectComponent, (state) => {
      return {...state, dotSrc: undefined, projectName: undefined, status: undefined};
    }),
);

export function reducer(state: any, action: any) {
  return _graphvizReducer(state, action);
}
