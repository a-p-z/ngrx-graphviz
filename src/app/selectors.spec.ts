import {selectDotSrc, selectNavListItems, selectProjectName, selectStatus} from "./selectors";

describe('Selectors', () => {

  it('when selectDotSrc', () => {
    expect(selectDotSrc({graphviz: {dotSrc: 'digraph { A->B }'}})).toEqual('digraph { A->B }');
  });

  it('when selectStatus', () => {
    expect(selectStatus({graphviz: {status: 'loading'}})).toEqual('loading');
  });

  it('when selectNavListItems', () => {
    expect(selectNavListItems({
      graphviz: {
        navListItems: [
          {id: 'A', label: 'A'},
          {id: 'B', label: 'B'}]
      }
    })).toEqual([{id: 'A', label: 'A'}, {id: 'B', label: 'B'}]);
  });

  it('when selectProjectName', () => {
    expect(selectProjectName({graphviz: {projectName: 'ngrx-graphviz'}})).toEqual('ngrx-graphviz');
  });

  afterEach(() => {
    expect().nothing();
  });
});
