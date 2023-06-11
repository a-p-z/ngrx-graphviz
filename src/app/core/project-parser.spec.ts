import {ProjectParser} from "./project-parser";
import {TestBed} from "@angular/core/testing";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {IEffect$, IReducer} from "../models";

describe('ProjectParser', () => {
  let projectParser: ProjectParser;
  let http: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
    projectParser = new ProjectParser();

    for (const url of [
      '/base/tsconfig.json',
      '/base/node_modules/@ngrx/store/public_api.d.ts',
      '/base/node_modules/@ngrx/store/src/state.d.ts',
      '/base/node_modules/@ngrx/store/src/utils.d.ts',
      '/base/node_modules/@ngrx/store/src/action_creator.d.ts',
      '/base/node_modules/@ngrx/store/src/flags.d.ts',
      '/base/node_modules/@ngrx/store/src/actions_subject.d.ts',
      '/base/node_modules/@ngrx/store/src/tokens.d.ts',
      '/base/node_modules/@ngrx/store/src/helpers.d.ts',
      '/base/node_modules/@ngrx/store/src/globals.d.ts',
      '/base/node_modules/@ngrx/store/src/reducer_creator.d.ts',
      '/base/node_modules/@ngrx/store/src/feature_creator.d.ts',
      '/base/node_modules/@ngrx/store/src/meta-reducers/utils.d.ts',
      '/base/node_modules/@ngrx/store/src/meta-reducers/serialization_reducer.d.ts',
      '/base/node_modules/@ngrx/store/src/meta-reducers/inNgZoneAssert_reducer.d.ts',
      '/base/node_modules/@ngrx/store/src/meta-reducers/immutability_reducer.d.ts',
      '/base/node_modules/@ngrx/store/src/meta-reducers/index.d.ts',
      '/base/node_modules/@ngrx/store/src/models.d.ts',
      '/base/node_modules/@ngrx/store/src/selector.d.ts',
      '/base/node_modules/@ngrx/store/src/feature_creator_models.d.ts',
      '/base/node_modules/@ngrx/store/src/store.d.ts',
      '/base/node_modules/@ngrx/store/src/store_module.d.ts',
      '/base/node_modules/@ngrx/store/src/scanned_actions_subject.d.ts',
      '/base/node_modules/@ngrx/store/src/reducer_manager.d.ts',
      '/base/node_modules/@ngrx/store/src/index.d.ts',
      '/base/node_modules/@ngrx/store/src/runtime_checks.d.ts',
      '/base/node_modules/@ngrx/store/index.d.ts',
      '/base/node_modules/@ngrx/effects/public_api.d.ts',
      '/base/node_modules/@ngrx/effects/src/utils.d.ts',
      '/base/node_modules/@ngrx/effects/src/lifecycle_hooks.d.ts',
      '/base/node_modules/@ngrx/effects/src/effect_creator.d.ts',
      '/base/node_modules/@ngrx/effects/src/tokens.d.ts',
      '/base/node_modules/@ngrx/effects/src/effects_metadata.d.ts',
      '/base/node_modules/@ngrx/effects/src/actions.d.ts',
      '/base/node_modules/@ngrx/effects/src/effect_sources.d.ts',
      '/base/node_modules/@ngrx/effects/src/effects_root_module.d.ts',
      '/base/node_modules/@ngrx/effects/src/models.d.ts',
      '/base/node_modules/@ngrx/effects/src/concat_latest_from.d.ts',
      '/base/node_modules/@ngrx/effects/src/act.d.ts',
      '/base/node_modules/@ngrx/effects/src/effects_module.d.ts',
      '/base/node_modules/@ngrx/effects/src/effect_notification.d.ts',
      '/base/node_modules/@ngrx/effects/src/effects_feature_module.d.ts',
      '/base/node_modules/@ngrx/effects/src/effects_resolver.d.ts',
      '/base/node_modules/@ngrx/effects/src/effects_error_handler.d.ts',
      '/base/node_modules/@ngrx/effects/src/effects_runner.d.ts',
      '/base/node_modules/@ngrx/effects/src/index.d.ts',
      '/base/node_modules/@ngrx/effects/src/effect_decorator.d.ts',
      '/base/node_modules/@ngrx/effects/index.d.ts',
      '/base/node_modules/@ngrx/effects/testing/public_api.d.ts',
      '/base/node_modules/@ngrx/effects/testing/testing.d.ts']) {
      const text = await firstValueFrom(http.get(url, {responseType: 'text'}));
      projectParser.createSourceFile(url, text);
    }
  });

  describe('getActions', () => {
    let actions: string[];

    beforeEach(() => {
      const text = 'import {createAction, props} from "@ngrx/store";' +
        'export const actionWithoutProps = createAction("[Test] Action without props");' +
        'export const actionWithProps = createAction("[Test] Action with props", props<{ prop: string }>());'
      projectParser.createSourceFile('/base/src/actions.ts', text);
      actions = projectParser.parse('/base/tsconfig.json').actions;
    });

    it('actions should contain "[Test] Action without props", "[Test] Action with props"', () => {
      expect(actions).toEqual(['[Test] Action without props', '[Test] Action with props']);
    });
  });

  describe('getReducers', () => {
    let reducers: IReducer[];

    beforeEach(() => {
      const text = 'import {createAction, createReducer, on, props} from "@ngrx/store";' +
        'const a = createAction("a", props<{ a: string }>());' +
        'const b1 = createAction("b1", props<{ b: string }>());' +
        'const b2 = createAction("b2", props<{ b: string }>());' +
        'const initialState = {};' +
        'const _reducer = createReducer(' +
        '  initialState,' +
        '  on(a, (state, {a}) => {' +
        '    return {...state, a};' +
        '  }),' +
        '  on(b1, b2, (state, {b}) => {' +
        '    return {...state, b};' +
        '  })' +
        ');';
      projectParser.createSourceFile('/base/src/reducer.ts', text);
      reducers = projectParser.parse('/base/tsconfig.json').reducers;
    });

    it('reducers should contain a->R, b1->R, b2->R', () => {
      expect(reducers).toEqual([{action: 'a', reducer: '_reducer'},
        {action: 'b1', reducer: '_reducer'},
        {action: 'b2', reducer: '_reducer'}]);
    });
  });

  describe('getEffects$', () => {
    const imports = 'import {createAction} from "@ngrx/store";' +
      'import {Actions, createEffect, ofType} from "@ngrx/effects";';

    [['by map', 'map(() => b())'],
      ['by switchMap and of', 'switchMap(() => of(b()))'],
      ['by switchMap', 'switchMap(() => [b()])']].forEach(([by, stmt]) => {
      describe(`when 'a' dispatches 'b' by ${by}`, () => {
        const actions = 'const a = createAction("a");' +
          'const b = createAction("b");';
        let effects$: IEffect$[];

        beforeEach(() => {
          const effects = 'export class Effects {' +
            'constructor(private actions$: Actions){}' +
            'effect$ = createEffect(() => {' +
            '    return this.actions$.pipe(' +
            '      ofType(a.type),' +
            `      ${stmt},` +
            '    );' +
            '  });' +
            '}';
          projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
          effects$ = projectParser.parse('/base/tsconfig.json').effects$;
        });

        it('effects$ should contain a->b', () => {
          expect(effects$).toEqual([{causes: ['a'], dispatch: true, effect$: 'effect$', effects: ['b'], errors: []}]);
        });
      });
    });

    [['by map', 'map(() => b())'],
      ['by switchMap and of', 'switchMap(() => of(b()))'],
      ['by switchMap', 'switchMap(() => [b()])']].forEach(([by, stmt]) => {
      describe(`when 'a' explicitly dispatches 'b' by ${by}`, () => {
        const actions = 'const a = createAction("a");' +
          'const b = createAction("b");';
        let effects$: IEffect$[];

        beforeEach(() => {
          const effects = 'export class Effects {' +
            'constructor(private actions$: Actions){}' +
            'effect$ = createEffect(() => {' +
            '    return this.actions$.pipe(' +
            '      ofType(a.type),' +
            `      ${stmt}` +
            '    );' +
            '  },' +
            '{ dispatch: true });' +
            '}';
          projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
          effects$ = projectParser.parse('/base/tsconfig.json').effects$;
        });

        it('effects$ should contain a->b', () => {
          expect(effects$).toEqual([{causes: ['a'], dispatch: true, effect$: 'effect$', effects: ['b'], errors: []}]);
        });
      });
    });

    [['by map', 'map(() => b())'],
      ['by switchMap and of', 'switchMap(() => of(b()))'],
      ['by switchMap', 'switchMap(() => [b()])'],
      ['', '']].forEach(([by, stmt]) => {
      describe(`when 'a' tries to dispatch 'b' by ${by} but dispatch is false`, () => {
        const actions = 'const a = createAction("a");' +
          'const b = createAction("b");';
        let effects$: IEffect$[];

        beforeEach(() => {
          const effects = 'export class Effects {' +
            'constructor(private actions$: Actions){}' +
            'effect$ = createEffect(() => {' +
            '    return this.actions$.pipe(' +
            '      ofType(a.type),' +
            `      ${stmt}` +
            '    );' +
            '  },' +
            '{ dispatch: false });' +
            '}';
          projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
          effects$ = projectParser.parse('/base/tsconfig.json').effects$;
        });

        it(`effects$ should contain a-| and the statement '${stmt}' should be ignored`, () => {
          expect(effects$).toEqual([{causes: ['a'], dispatch: false, effect$: 'effect$', effects: [], errors: []}]);
        });
      });
    });

    describe("when 'a' dispatches 'b' and 'c'", () => {
      const actions = 'const a = createAction("a");' +
        'const b = createAction("b");' +
        'const c = createAction("c");';

      let effects$: IEffect$[];

      beforeEach(() => {
        const effects = 'export class Effects {' +
          'constructor(private actions$: Actions){}' +
          'effect$ = createEffect(() => {' +
          '    return this.actions$.pipe(' +
          '      ofType(a.type),' +
          '      switchMap(() => [b(), c()])' +
          '    );' +
          '  });' +
          '}';
        projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
        effects$ = projectParser.parse('/base/tsconfig.json').effects$;
      });

      it("effects$ should contain a->b,c", () => {
        expect(effects$).toEqual([{
          causes: ['a'],
          dispatch: true,
          effect$: 'effect$',
          effects: ['b', 'c'],
          errors: []
        }]);
      });
    });

    [['by map', 'map(() => c())'],
      ['by switchMap and of', 'switchMap(() => of(c()))'],
      ['by switchMap', 'switchMap(() => [c()])']].forEach(([by, stmt]) => {
      describe(`when 'a' and 'b' dispatch 'c' by ${by}`, () => {
        const actions = 'const a = createAction("a");' +
          'const b = createAction("b");' +
          'const c = createAction("c");';

        let effects$: IEffect$[];

        beforeEach(() => {
          const effects = 'export class Effects {' +
            'constructor(private actions$: Actions){}' +
            'effect$ = createEffect(() => {' +
            '    return this.actions$.pipe(' +
            '      ofType(a.type, b.type),' +
            `      ${stmt}` +
            '    );' +
            '  });' +
            '}';
          projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
          effects$ = projectParser.parse('/base/tsconfig.json').effects$;
        });

        it("effects$ should contain a,b->c", () => {
          expect(effects$).toEqual([{
            causes: ['a', 'b'],
            dispatch: true,
            effect$: 'effect$',
            effects: ['c'],
            errors: []
          }]);
        });
      });
    });

    describe("when 'a' and 'b' dispatch 'c' and 'd'", () => {
      const actions = 'const a = createAction("a");' +
        'const b = createAction("b");' +
        'const c = createAction("c");' +
        'const d = createAction("d");';

      let effects$: IEffect$[];

      beforeEach(() => {
        const effects = 'export class Effects {' +
          'constructor(private actions$: Actions){}' +
          'effect$ = createEffect(() => {' +
          '    return this.actions$.pipe(' +
          '      ofType(a.type, b.type),' +
          '      switchMap(() => [c(), d()])' +
          '    );' +
          '  });' +
          '}';
        projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
        effects$ = projectParser.parse('/base/tsconfig.json').effects$;
      });

      it("effects$ should contain a,b->c,d", () => {
        expect(effects$).toEqual([{
          causes: ['a', 'b'],
          dispatch: true,
          effect$: 'effect$',
          effects: ['c', 'd'],
          errors: []
        }]);
      });
    });

    ['catchError((error) => of(e({error})))',
      'catchError((error) => [e({error})])'].forEach((stmt) => {
      describe("when 'e' is catchError for 'a'", () => {
        const actions = 'const a = createAction("a");' +
          'const e = createAction("e", props<{ error: any }>());';

        let effects$: IEffect$[];

        beforeEach(() => {
          const effects = 'export class Effects {' +
            'constructor(private actions$: Actions){}' +
            'effect$ = createEffect(() => {' +
            '    return this.actions$.pipe(' +
            '      ofType(a.type),' +
            `      ${stmt}` +
            '    );' +
            '  });' +
            '}';
          projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
          effects$ = projectParser.parse('/base/tsconfig.json').effects$;
        });

        it("effects$ should contain a#e", () => {
          expect(effects$).toEqual([{causes: ['a'], dispatch: true, effect$: 'effect$', effects: [], errors: ['e']}]);
        });
      });
    });

    describe("when 'e1' and 'e2' are catchError for 'a'", () => {
      const actions = 'const a = createAction("a");' +
        'const e1 = createAction("e1", props<{ error: any }>());' +
        'const e2 = createAction("e2", props<{ error: any }>());';

      let effects$: IEffect$[];

      beforeEach(() => {
        const effects = 'export class Effects {' +
          'constructor(private actions$: Actions){}' +
          'effect$ = createEffect(() => {' +
          '    return this.actions$.pipe(' +
          '      ofType(a.type),' +
          '      catchError((error) => [e1({error}), e2({error})])' +
          '    );' +
          '  });' +
          '}';
        projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
        effects$ = projectParser.parse('/base/tsconfig.json').effects$;
      });

      it("effects$ should contain a#e1,e2", () => {
        expect(effects$).toEqual([{
          causes: ['a'],
          dispatch: true,
          effect$: 'effect$',
          effects: [],
          errors: ['e1', 'e2']
        }]);
      });
    });

    ['catchError((error) => of(e({error})))',
      'catchError((error) => [e({error})])'].forEach((stmt) => {
      describe("when 'e' is catchError for 'a' and 'b'", () => {
        const actions = 'const a = createAction("a");' +
          'const b = createAction("b");' +
          'const e = createAction("e", props<{ error: any }>());';

        let effects$: IEffect$[];

        beforeEach(() => {
          const effects = 'export class Effects {' +
            'constructor(private actions$: Actions){}' +
            'effect$ = createEffect(() => {' +
            '    return this.actions$.pipe(' +
            '      ofType(a.type, b.type),' +
            `      ${stmt}` +
            '    );' +
            '  });' +
            '}';
          projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
          effects$ = projectParser.parse('/base/tsconfig.json').effects$;
        });

        it("effects$ should contain a,b#e", () => {
          expect(effects$).toEqual([{
            causes: ['a', 'b'],
            dispatch: true,
            effect$: 'effect$',
            effects: [],
            errors: ['e']
          }]);
        });
      });
    });

    describe("when 'e1' and 'e2' are catchError for 'a' and 'b'", () => {
      const actions = 'const a = createAction("a");' +
        'const b = createAction("b");' +
        'const e1 = createAction("e1", props<{ error: any }>());' +
        'const e2 = createAction("e2", props<{ error: any }>());';

      let effects$: IEffect$[];

      beforeEach(() => {
        const effects = 'export class Effects {' +
          'constructor(private actions$: Actions){}' +
          'effect$ = createEffect(() => {' +
          '    return this.actions$.pipe(' +
          '      ofType(a.type, b.type),' +
          '      catchError((error) => [e1({error}), e2({error})])' +
          '    );' +
          '  });' +
          '}';
        projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
        effects$ = projectParser.parse('/base/tsconfig.json').effects$;
      });

      it("effects$ should contain a,b#e1,e2", () => {
        expect(effects$).toEqual([{
          causes: ['a', 'b'],
          dispatch: true,
          effect$: 'effect$',
          effects: [],
          errors: ['e1', 'e2']
        }]);
      });
    });

    ['catchError((error) => of(e({error})))',
      'catchError((error) => [e({error})])'].forEach((stmt) => {
      describe("when 'e' is catchError for non dispatching 'a'", () => {
        const actions = 'const a = createAction("a");' +
          'const e = createAction("e", props<{ error: any }>());';

        let effects$: IEffect$[];

        beforeEach(() => {
          const effects = 'export class Effects {' +
            'constructor(private actions$: Actions){}' +
            'effect$ = createEffect(() => {' +
            '    return this.actions$.pipe(' +
            '      ofType(a.type),' +
            `      ${stmt}` +
            '    );' +
            '  },' +
            '{ dispatch: false });' +
            '}';
          projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
          effects$ = projectParser.parse('/base/tsconfig.json').effects$;
        });

        it("effects$ should contain a#e", () => {
          expect(effects$).toEqual([{causes: ['a'], dispatch: false, effect$: 'effect$', effects: [], errors: ['e']}]);
        });
      });
    });

    describe("when 'e1' and 'e2' are catchError for non dispatching 'a'", () => {
      const actions = 'const a = createAction("a");' +
        'const e1 = createAction("e1", props<{ error: any }>());' +
        'const e2 = createAction("e2", props<{ error: any }>());';

      let effects$: IEffect$[];

      beforeEach(() => {
        const effects = 'export class Effects {' +
          'constructor(private actions$: Actions){}' +
          'effect$ = createEffect(() => {' +
          '    return this.actions$.pipe(' +
          '      ofType(a.type),' +
          '      catchError((error) => [e1({error}), e2({error})])' +
          '    );' +
          '  },' +
          '{ dispatch: false });' +
          '}';
        projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
        effects$ = projectParser.parse('/base/tsconfig.json').effects$;
      });

      it("effects$ should contain a#e1,e2", () => {
        expect(effects$).toEqual([{
          causes: ['a'],
          dispatch: false,
          effect$: 'effect$',
          effects: [],
          errors: ['e1', 'e2']
        }]);
      });
    });

    ['catchError((error) => of(e({error})))',
      'catchError((error) => [e({error})])'].forEach((stmt) => {
      describe("when 'e' is catchError for 'a' and 'b'", () => {
        const actions = 'const a = createAction("a");' +
          'const b = createAction("b");' +
          'const e = createAction("e", props<{ error: any }>());';

        let effects$: IEffect$[];

        beforeEach(() => {
          const effects = 'export class Effects {' +
            'constructor(private actions$: Actions){}' +
            'effect$ = createEffect(() => {' +
            '    return this.actions$.pipe(' +
            '      ofType(a.type, b.type),' +
            `      ${stmt}` +
            '    );' +
            '  },' +
            '{ dispatch: false });' +
            '}';
          projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
          effects$ = projectParser.parse('/base/tsconfig.json').effects$;
        });

        it("effects$ should contain a,b#e", () => {
          expect(effects$).toEqual([{
            causes: ['a', 'b'],
            dispatch: false,
            effect$: 'effect$',
            effects: [],
            errors: ['e']
          }]);
        });
      });
    });

    describe("when 'e1' and 'e2' are catchError for non dispatching 'a' and 'b'", () => {
      const actions = 'const a = createAction("a");' +
        'const b = createAction("b");' +
        'const e1 = createAction("e1", props<{ error: any }>());' +
        'const e2 = createAction("e2", props<{ error: any }>());';

      let effects$: IEffect$[];

      beforeEach(() => {
        const effects = 'export class Effects {' +
          'constructor(private actions$: Actions){}' +
          'effect$ = createEffect(() => {' +
          '    return this.actions$.pipe(' +
          '      ofType(a.type, b.type),' +
          '      catchError((error) => [e1({error}), e2({error})])' +
          '    );' +
          '  },' +
          '{ dispatch: false });' +
          '}';
        projectParser.createSourceFile('/base/src/effects.ts', `${imports}${actions}${effects}`);
        effects$ = projectParser.parse('/base/tsconfig.json').effects$;
      });

      it("effects$ should contain a,b#e1,e2", () => {
        expect(effects$).toEqual([{
          causes: ['a', 'b'],
          dispatch: false,
          effect$: 'effect$',
          effects: [],
          errors: ['e1', 'e2']
        }]);
      });
    });
  });

  describe('particular cases', () => {
    const imports = 'import {createAction} from "@ngrx/store";' +
      'import {Actions, createEffect, ofType} from "@ngrx/effects";';

    describe("when effects and error are returned by a function", () => {
      const actions = 'const a = createAction("a");' +
        'const b = createAction("b");' +
        'const c = createAction("c");' +
        'const e1 = createAction("e1");' +
        'const e2 = createAction("e2");';

      let effects$: IEffect$[];

      beforeEach(() => {
        const effects = 'export class Effects {' +
          'constructor(private actions$: Actions){}' +
          '  effect$ = createEffect(() => {' +
          '    return this.actions$.pipe(' +
          '      ofType(a.type),' +
          '      map(() => this.f()),' +
          '      catchError((error) => this.e(error)));' +
          '  });' +
          '  private f(): TypedAction<"b" | "c"> {' +
          '    return b();'+
          '  }'+
          '  private e(): TypedAction<"e1" | "e2"> {' +
          '    return e1();'+
          '  }'+
          '}';
        projectParser.createSourceFile('/base/src/effects.ts', `import {TypedAction} from "@ngrx/store/src/models";${imports}${actions}${effects}`);
        effects$ = projectParser.parse('/base/tsconfig.json').effects$;
      });

      it("effects$ should contain a->b,c and a#e1,e2", () => {
        expect(effects$).toEqual([{
          causes: ['a'],
          dispatch: true,
          effect$: 'effect$',
          effects: ['b', 'c'],
          errors: ['e1', 'e2']
        }]);
      });
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
