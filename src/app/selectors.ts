import {createFeatureSelector, createSelector} from '@ngrx/store';
import {GraphvizState} from 'src/app/reducer';

const selectGraphviz = createFeatureSelector<GraphvizState>('graphviz');

export const selectDotSrc = createSelector(selectGraphviz, ({dotSrc}) => dotSrc);
export const selectStatus = createSelector(selectGraphviz, ({status}) => status);
export const selectNavListItems = createSelector(selectGraphviz, ({navListItems}) => navListItems);
export const selectProjectName = createSelector(selectGraphviz, ({projectName}) => projectName);
