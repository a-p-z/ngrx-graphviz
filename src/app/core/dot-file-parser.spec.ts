import {DotFileParser} from "./dot-file-parser";
import {INavListItem} from "../models";

describe('DotFileParser', () => {
  let dotFileParser: DotFileParser;

  beforeEach(() => {
    dotFileParser = new DotFileParser();
  });

  describe('when createDotSrc', () => {
    const action = '[E] e';
    const effect$1 = {
      dispatch: true,
      causes: ['[A] a', '[B] b'],
      effect$: 'effect1$',
      effects: ['[C] c', '[D] d'],
      errors: []
    };
    const effect$2 = {
      dispatch: false,
      causes: ['[F] f', '[G] g'],
      effect$: 'effect2$',
      effects: [],
      errors: []
    };
    const effect$3 = {
      dispatch: true,
      causes: ['[H] h', '[I] i'],
      effect$: 'effect3$',
      effects: ['[L] l'],
      errors: ['[E] e1', '[E] e2']
    };
    const effect$4 = {
      dispatch: false,
      causes: ['[M] m', '[N] n'],
      effect$: 'effect4$',
      effects: [],
      errors: ['[E] e3', '[E] e4']
    };
    const reducer = {reducer: 'reducer', action: '[R] r'};

    let dotSrc: string;

    beforeEach(() => {
      dotSrc = dotFileParser.createDotSrc([action], [effect$1, effect$2, effect$3, effect$4], [reducer]);
    });

    it('dotSrc should have 25 nodes', () => {
      expect(dotSrc.match(/ {4}"[^"]+" \[/g)).toHaveSize(25);
    });

    it('dotSrc should have 19 edges', () => {
      expect(dotSrc.match(/ {4}".+" -> ".+"/g)).toHaveSize(19);
    });

    ['[A] a',
      '[B] b',
      '[F] f',
      '[G] g',
      '[H] h',
      '[I] i',
      '[M] m',
      '[N] n'].forEach((cause) => {
      it(`dotSrc should contain a node for ${cause}`, () => {
        expect(dotSrc).toContain(`"${cause}" [id="${cause}" label="${cause.replace(' ', '\\n')}" fillcolor="#ff4081" fontcolor="#ffffff" tooltip=""]`);
      });
    });

    ['[C] c',
      '[D] d',
      '[L] l'].forEach((effect) => {
      it(`dotSrc should contain a node for ${effect}`, () => {
        expect(dotSrc).toContain(`"${effect}" [id="${effect}" label="${effect.replace(' ', '\\n')}" fillcolor="#ff4081" fontcolor="#ffffff" tooltip=""]`);
      });
    });

    [{cause: '[A] a', effect: '[C] c'},
      {cause: '[A] a', effect: '[D] d'},
      {cause: '[B] b', effect: '[C] c'},
      {cause: '[B] b', effect: '[D] d'},
      {cause: '[H] h', effect: '[L] l'},
      {cause: '[I] i', effect: '[L] l'}].forEach(({cause, effect}) => {
      it(`dotSrc should contain a dispatching edge from ${cause} to ${effect}`, () => {
        expect(dotSrc).toContain(`"${cause}" -> "${effect}" [tooltip="Dispatches\\n${effect}"]`);
      });
    });

    ['[F] f',
      '[G] g'].forEach((cause) => {
      it(`dotSrc should contain a non dispatching node for ${cause}`, () => {
        expect(dotSrc).toContain(`"${cause}" [id="${cause}" label="${cause.replace(' ', '\\n')}" fillcolor="#ff4081" fontcolor="#ffffff" tooltip=""]`);
      });
    });

    [{cause: '[F] f', effect$: 'effect2$'},
      {cause: '[G] g', effect$: 'effect2$'},
      {cause: '[M] m', effect$: 'effect4$'},
      {cause: '[N] n', effect$: 'effect4$'}].forEach(({cause, effect$}) => {
      it(`dotSrc should contain an invisible node for the non dispatching action ${cause}`, () => {
        expect(dotSrc).toContain(`"${cause}-${effect$}" [color="invis" label=""]`);
      });
    });

    ['[F] f',
      '[G] g'].forEach((cause) => {
      it(`dotSrc should contain a non dispatching edge for ${cause}`, () => {
        expect(dotSrc).toContain(`"${cause}" -> "${cause}-effect2$" [arrowhead="tee" tooltip="Non dispatching effect\\neffect2$"]`);
      });
    });

    [
      {cause: '[H] h', error: '[E] e1'},
      {cause: '[H] h', error: '[E] e2'},
      {cause: '[I] i', error: '[E] e1'},
      {cause: '[I] i', error: '[E] e2'},
      {cause: '[M] m', error: '[E] e3'},
      {cause: '[M] m', error: '[E] e4'},
      {cause: '[N] n', error: '[E] e3'},
      {cause: '[N] n', error: '[E] e4'}].forEach(({cause, error}) => {
      it(`dotSrc should contain a node for ${error}`, () => {
        expect(dotSrc).toContain(`"${cause}-${error}" [id="${cause}-${error}" label="${error.replace(' ', '\\n')}" fillcolor="#f44336" fontcolor="#ffffff" tooltip="${error}"]`);
      });
    });

    [{cause: '[H] h', effect$: 'effect3$', error: '[E] e1'},
      {cause: '[H] h', effect$: 'effect3$', error: '[E] e2'},
      {cause: '[I] i', effect$: 'effect3$', error: '[E] e1'},
      {cause: '[I] i', effect$: 'effect3$', error: '[E] e2'},
      {cause: '[M] m', effect$: 'effect4$', error: '[E] e3'},
      {cause: '[M] m', effect$: 'effect4$', error: '[E] e4'},
      {cause: '[N] n', effect$: 'effect4$', error: '[E] e3'},
      {cause: '[N] n', effect$: 'effect4$', error: '[E] e4'}].forEach(({cause, effect$, error}) => {
      it(`dotSrc should contain a catch error edge from ${cause} to ${error}`, () => {
        expect(dotSrc).toContain(`"${cause}" -> "${cause}-${error}" [color="#f44336" style="dashed" tooltip="Error caught\\n${effect$}"]`);
      });
    });

    [action].forEach((action) => {
      it(`dotSrc should contain a node for ${action}`, () => {
        expect(dotSrc).toContain(`"${action}" [id="${action}" label="${action.replace(' ', '\\n')}" fillcolor="#ff4081" fontcolor="#ffffff" tooltip=""]`);
      });
    });

    [reducer].forEach(({reducer, action}) => {
      it(`dotSrc should contain a store icon for ${reducer}`, () => {
        expect(dotSrc).toContain(`"${reducer}-${action}" [image="assets/store.svg" label="" style="" tooltip="store"]`);
      });
    });

    [reducer].forEach(({reducer, action}) => {
      it(`dotSrc should contain an edge from ${action} to a store icon`, () => {
        expect(dotSrc).toContain(`"${action}" -> "${reducer}-${action}" [tooltip="${reducer}"]`);
      });
    });
  });

  describe('when getNavListItemsFromDotSrc', () => {
    let navListItems: INavListItem[];

    beforeEach(() => {
      const dotSrc = 'digraph {' +
        '"[Effects] Create dot src" [label="[Effects]\\nCreate dot src"]; ' +
        '"[Effects] Create dot src succeeded" [label="[Effects]\\nCreate dot src succeeded"]; ' +
        '"[Effects] Create dot src" -> subgraph {' +
        '    "[Effects] Open snackbar" [label="[Effects]\\nOpen snackbar"];' +
        '  }'+
        '}';
      navListItems = dotFileParser.getNavListItemsFromDotSrc(dotSrc);
    });

    it('navListItems should be retrieved', () => {
      expect(navListItems).toEqual([
        {id: '[Effects] Create dot src', label: '[Effects]<br/>Create dot src'},
        {id: '[Effects] Create dot src succeeded', label: '[Effects]<br/>Create dot src succeeded'},
        {id: '[Effects] Open snackbar', label: '[Effects]<br/>Open snackbar'}]);
    });
  });

  describe('when getNavListItemsFromActions', () => {
    let navListItems: INavListItem[];

    beforeEach(() => {
      const actions = ['[Effects] Create dot src',
        '[Effects] Create dot src succeeded'];
      navListItems = dotFileParser.getNavListItemsFromActions(actions);
    });

    it('navListItems should be retrieved', () => {
      expect(navListItems).toEqual([{id: '[Effects] Create dot src', label: '[Effects]<br/>Create dot src'},
        {id: '[Effects] Create dot src succeeded', label: '[Effects]<br/>Create dot src succeeded'}]);
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
