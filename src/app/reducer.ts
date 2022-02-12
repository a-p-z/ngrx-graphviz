import {createReducer, on} from '@ngrx/store';
import {
  createDotSrcSucceeded,
  readDotFileFromOpenDotFileComponent,
  readDotFileSucceeded,
  readProjectFromOpenProjectComponent,
  renderSucceededFromGraphvizComponent,
  resetStatus,
  resetStatusFromGraphvizComponent,
  resetStatusFromOpenDotFileComponent,
  resetStatusFromOpenProjectComponent,
  resolveNavListItemsSucceeded,
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
  on(createDotSrcSucceeded,
    readDotFileSucceeded, (state, {dotSrc}) => {
      return {...state, dotSrc};
    }),
  on(readDotFileFromOpenDotFileComponent, (state) => {
    return {...state, status: 'loading'};
  }),
  on(readProjectFromOpenProjectComponent, (state, {projectName}) => {
    return {...state, status: 'loading', projectName};
  }),
  on(renderSucceededFromGraphvizComponent, (state) => {
    return {...state, status: 'loaded'};
  }),
  on(resolveNavListItemsSucceeded, (state, {navListItems}) => {
    return {...state, navListItems};
  }),
  on(resetStatus,
    resetStatusFromGraphvizComponent,
    resetStatusFromOpenDotFileComponent,
    resetStatusFromOpenProjectComponent, (state) => {
      return {...state, dotSrc: undefined, projectName: undefined, status: undefined};
    })
);

export function reducer(state: any, action: any) {
  return _graphvizReducer(state, action);
}
