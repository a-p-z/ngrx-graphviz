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
} from "./actions";
import {GraphvizState, reducer} from "./reducer";

describe('Reducer', () => {
  [changeSrcDotFromCreateDotSrc, changeSrcDotFromReadDotSrc].forEach((action) => {
    it(`on '${action.type}' dotSrc should be 'digraph { A-> B}'`, () => {
      expect(reducer({}, action({dotSrc: 'digraph { A-> B}'})))
        .toEqual({dotSrc: 'digraph { A-> B}'} as GraphvizState);
    });
  });

  it(`on '${changeStatusFromOpenDotFileComponent.type}' status should be 'loading'`, () => {
    expect(reducer({}, changeStatusFromOpenDotFileComponent()))
      .toEqual({status: 'loading'} as GraphvizState);
  });

  it(`on '${changeStatusFromOpenProjectComponent.type}' status should be 'loading' and projectName should be 'ngrx-graphviz'`, () => {
    expect(reducer({}, changeStatusFromOpenProjectComponent({projectName: 'ngrx-graphviz'})))
      .toEqual({status: 'loading', projectName: 'ngrx-graphviz'} as GraphvizState);
  });

  it(`on '${changeStatusFromGraphvizComponent.type}' status should be 'loaded'`, () => {
    expect(reducer({}, changeStatusFromGraphvizComponent()))
      .toEqual({status: 'loaded'} as GraphvizState);
  });

  [changeNavListItemsFromOpenDotFile, changeNavListItemsFromParseProject].forEach((action) => {
    it(`on '${action.type}' navListItems should be updated`, () => {
      expect(reducer({}, action({navListItems: [{id: 'A', label: 'A'}, {id: 'B', label: 'B'}]})))
        .toEqual({navListItems: [{id: 'A', label: 'A'}, {id: 'B', label: 'B'}]} as GraphvizState);
    });
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
