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
  resolveNavListItemsSucceeded
} from "./actions";
import {GraphvizState, reducer} from "./reducer";

describe('Reducer', () => {

  [createDotSrcSucceeded, readDotFileSucceeded].forEach((action) => {
    it(`on '${action.type}' dotSrc should be 'digraph { A-> B}'`, () => {
      expect(reducer({}, action({dotSrc: 'digraph { A-> B}'})))
        .toEqual({dotSrc: 'digraph { A-> B}'} as GraphvizState);
    });
  });

  it(`on '${readDotFileFromOpenDotFileComponent.type}' status should be 'loading'`, () => {
    expect(reducer({}, readDotFileFromOpenDotFileComponent({file: new File([], 'test')})))
      .toEqual({status: 'loading'} as GraphvizState);
  });

  it(`on '${readProjectFromOpenProjectComponent.type}' status should be 'loading' and projectName should be 'ngrx-graphviz'`, () => {
    expect(reducer({}, readProjectFromOpenProjectComponent({projectName: 'ngrx-graphviz', files: []})))
      .toEqual({status: 'loading', projectName: 'ngrx-graphviz'} as GraphvizState);
  });

  it(`on '${renderSucceededFromGraphvizComponent.type}' status should be 'loaded'`, () => {
    expect(reducer({}, renderSucceededFromGraphvizComponent()))
      .toEqual({status: 'loaded'} as GraphvizState);
  });

  it(`on '${resolveNavListItemsSucceeded.type}' navListItems should be updated`, () => {
    expect(reducer({}, resolveNavListItemsSucceeded({navListItems: [{id: 'A', label: 'A'}, {id: 'B', label: 'B'}]})))
      .toEqual({navListItems: [{id: 'A', label: 'A'}, {id: 'B', label: 'B'}]} as GraphvizState);
  });

  [resetStatus,
    resetStatusFromGraphvizComponent,
    resetStatusFromOpenDotFileComponent,
    resetStatusFromOpenProjectComponent].forEach((action) => {
    it(`on '${action.type}' dotSrc, projectName and status should be undefined`, () => {
      expect(reducer({status: 'loading', projectName: 'ngrx-graphviz', dotSrc: 'digraph { A-> B}'}, action()))
        .toEqual({dotSrc: undefined, projectName: undefined, status: undefined} as GraphvizState);
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
