import {TestBed} from "@angular/core/testing";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {provideMockActions} from "@ngrx/effects/testing";
import {Observable, of} from "rxjs";
import {TypedAction} from "@ngrx/store/src/models";
import {GraphvizEffects} from "./effects";
import {DotFileParser} from "./core/dot-file-parser";
import {ProjectParser} from "./core/project-parser";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TextFileReader} from "./core/text-file-reader";
import {
  createDotSrc,
  createDotSrcSucceeded,
  openSnackBar,
  openSnackBarFromGraphvizComponent,
  openSnackBarFromOpenFileComponent,
  openSnackBarFromOpenProjectComponent,
  readDotFileFromOpenDotFileComponent,
  readDotFileSucceeded,
  readProjectFromOpenProjectComponent,
  readProjectSucceeded,
  resetStatus,
  resolveNavListItemsSucceeded,
  saveDotFileFromSaveDotFileComponent
} from "./actions";
import {TestScheduler} from "rxjs/testing";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe("Effects", () => {
  const initialState = {};

  let actions$: Observable<TypedAction<string>>;
  let effects: GraphvizEffects;
  let document: SpyObj<Document>;
  let dotFileParser: SpyObj<DotFileParser>;
  let projectParser: SpyObj<ProjectParser>;
  let snackBar: SpyObj<MatSnackBar>;
  let textFileReader: SpyObj<TextFileReader>;
  let testScheduler: TestScheduler;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        GraphvizEffects,
        provideMockActions(() => actions$),
        provideMockStore({initialState}),
        {provide: Document, useValue: createSpyObj("document", ["createElement"])},
        {
          provide: DotFileParser,
          useValue: createSpyObj("dotFileParser", ["createDotSrc", "getNavListItemsFromActions", "getNavListItemsFromDotSrc"])
        },
        {provide: ProjectParser, useValue: createSpyObj("projectParser", ["createSourceFile", "parse"])},
        {provide: MatSnackBar, useValue: createSpyObj("snackBar", ["open"])},
        {provide: TextFileReader, useValue: createSpyObj("textFileReader", ["read"])}]
    });
    effects = TestBed.inject(GraphvizEffects);
    store = TestBed.inject(MockStore);
    document = TestBed.inject(Document) as SpyObj<Document>;
    dotFileParser = TestBed.inject(DotFileParser) as SpyObj<DotFileParser>;
    projectParser = TestBed.inject(ProjectParser) as SpyObj<ProjectParser>;
    snackBar = TestBed.inject(MatSnackBar) as SpyObj<MatSnackBar>;
    textFileReader = TestBed.inject(TextFileReader) as SpyObj<TextFileReader>;
    testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  describe(`when '${createDotSrc.type}' is dispatched`, () => {
    describe("and dotFileParser.createDotSrc succeeds", () => {
      beforeEach(() => {
        dotFileParser.createDotSrc.and.returnValue("digraph { A->B }");
      });

      it(`createDotSrc$ should return '${createDotSrcSucceeded.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot("a|", {a: createDotSrc({actions: [], effects$: [], reducers: []})});
          expectObservable(effects.createDotSrc$).toBe("b|", {b: createDotSrcSucceeded({dotSrc: "digraph { A->B }"})});
        });
      });
    });

    describe("and dotFileParser.createDotSrc fails", () => {
      beforeEach(() => {
        dotFileParser.createDotSrc.and.throwError("simulated error");
      });

      it(`createDotSrc$ should return '${openSnackBar.type}' and '${resetStatus.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot("a|", {a: createDotSrc({actions: [], effects$: [], reducers: []})});
          expectObservable(effects.createDotSrc$).toBe("(or|)", {
            o: openSnackBar({message: "Error creating dot src", error: new Error("simulated error")}),
            r: resetStatus()
          });
        });
      });
    });
  });

  [openSnackBar,
    openSnackBarFromGraphvizComponent,
    openSnackBarFromOpenFileComponent,
    openSnackBarFromOpenProjectComponent].forEach((action) => {
    describe(`when '${action.type}' is dispatched`, () => {
      [{error: undefined, expected: 'simulated message'},
        {error: 'simulated error', expected: 'simulated message: simulated error'}].forEach(({error, expected}) => {
        beforeEach(() => {
          actions$ = of(action({message: 'simulated message', error}));
          effects.openSnackBar$.subscribe();
        });

        it(`openSnackBar$ should return '${action.type}'`, () => {
          expect(snackBar.open).toHaveBeenCalledWith(expected);
        });
      });
    });
  });

  describe(`when '${readDotFileFromOpenDotFileComponent.type}' is dispatched`, () => {
    const file = new File([], 'test');

    describe('and textFileReader.read succeeds', () => {
      it(`readDotFile$ should return '${readDotFileSucceeded.type}'`, () => {
        testScheduler.run(({cold, hot, expectObservable}) => {
          actions$ = hot('a|', {a: readDotFileFromOpenDotFileComponent({file})});
          textFileReader.read.and.returnValue(cold('b|', {b: 'digraph { A->B }'}));
          expectObservable(effects.readDotFile$).toBe('c|', {c: readDotFileSucceeded({dotSrc: 'digraph { A->B }'})});
        });
      });
    });

    describe('and textFileReader.read fails', () => {
      const error = new Error('simulated error');

      it(`readDotFile$ should return '${openSnackBar.type}' and '${resetStatus.type}'`, () => {
        testScheduler.run(({cold, hot, expectObservable}) => {
          actions$ = hot('a|', {a: readDotFileFromOpenDotFileComponent({file})});
          textFileReader.read.and.returnValue(cold('#|', {}, error));
          expectObservable(effects.readDotFile$).toBe('(or|)', {
            o: openSnackBar({message: 'Error reading dot file', error}),
            r: resetStatus()
          });
        });
      });
    });
  });

  describe(`when '${readProjectFromOpenProjectComponent.type}' is dispatched`, () => {
    describe('and textFileReader.read succeeds', () => {
      const files = [{webkitRelativePath: 'test/file1'}, {webkitRelativePath: 'test/file2'}] as File[];

      describe('and projectParser.createSourceFile succeeds', () => {
        beforeEach(() => {
          projectParser.createSourceFile.and.callFake((path, text) => {
            return {path, text}
          });
        });

        it(`readProject$ should return '${readProjectSucceeded.type}'`, () => {
          testScheduler.run(({cold, hot, expectObservable}) => {
            actions$ = hot('a|', {a: readProjectFromOpenProjectComponent({projectName: 'ngrx-graphviz', files})});
            textFileReader.read.and.returnValues(cold('b|', {b: 'file 1 content'}), cold('c|', {c: 'file 2 content'}));
            expectObservable(effects.readProject$).toBe('((d|))', {
              d: readProjectSucceeded({
                sourceFiles: [
                  {path: 'test/file1', text: 'file 1 content'},
                  {path: 'test/file2', text: 'file 2 content'}]
              })
            });
          });
        });
      });

      describe('and projectParser.createSourceFile fails', () => {
        beforeEach(() => {
          projectParser.createSourceFile
            .withArgs('test/file1', 'file 1 content').and.callFake((path, text) => {
            return {path, text}
          })
            .withArgs('test/file2', 'file 2 content').and.throwError('simulated error')
        });

        it(`readProject$ should return '${readProjectSucceeded.type}'`, () => {
          testScheduler.run(({cold, hot, expectObservable}) => {
            actions$ = hot('a|', {a: readProjectFromOpenProjectComponent({projectName: 'ngrx-graphviz', files})});
            textFileReader.read.and.returnValues(cold('b|', {b: 'file 1 content'}), cold('c|', {c: 'file 2 content'}));
            expectObservable(effects.readProject$).toBe('(or|)', {
              o: openSnackBar({message: 'Error reading project', error: new Error('simulated error')}),
              r: resetStatus()
            });
          });
        });
      });
    });

    describe('and textFileReader.read fails', () => {
      const error = new Error('simulated error');

      it(`readProject$ should return '${openSnackBar.type}' and '${resetStatus.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('#|', {}, error);
          expectObservable(effects.readProject$).toBe('(or|)', {
            o: openSnackBar({message: 'Error reading project', error}),
            r: resetStatus()
          });
        });
      });
    });
  });

  describe(`when '${readProjectSucceeded.type}' is dispatched`, () => {
    const tsconfig = {path: "tsconfig.json", text: ''};

    describe('and projectParser.parse succeeds', () => {
      beforeEach(() => {
        projectParser.parse.and.returnValue({actions: [], effects$: [], reducers: []});
      });

      it(`readProjectSucceeded$ should return '${createDotSrc.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a: readProjectSucceeded({sourceFiles: [tsconfig]})});
          expectObservable(effects.readProjectSucceeded$).toBe('b|', {
            b: createDotSrc({actions: [], effects$: [], reducers: []})
          });
        });
      });
    });

    describe('and projectReader.parse fails', () => {
      beforeEach(() => {
        projectParser.parse.and.throwError('simulated error');
      });

      it(`readProjectSucceeded$ should return '${openSnackBar.type}' and '${resetStatus.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a: readProjectSucceeded({sourceFiles: [tsconfig]})});
          expectObservable(effects.readProjectSucceeded$).toBe('(or|)', {
            o: openSnackBar({message: 'Error analyzing project', error: new Error('simulated error')}),
            r: resetStatus()
          });
        });
      });
    });
  });

  describe(`when '${createDotSrc.type}' is dispatched`, () => {
    describe('and dotFileParser.getNavListItemsFromActions succeeds', () => {
      beforeEach(() => {
        dotFileParser.getNavListItemsFromActions.and.returnValue([]);
      });

      it(`resolveNavListItemsFromActions$ should return '${resolveNavListItemsSucceeded.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a: createDotSrc({actions: [], effects$: [], reducers: []})});
          expectObservable(effects.resolveNavListItemsFromActions$).toBe('b|', {b: resolveNavListItemsSucceeded({navListItems: []})});
        });
      });
    });

    describe('and dotFileParser.getNavListItemsFromActions fails', () => {
      beforeEach(() => {
        dotFileParser.getNavListItemsFromActions.and.throwError('simulated error');
      });

      it(`resolveNavListItemsFromActions$ should return '${openSnackBar.type}' and '${resetStatus.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a: createDotSrc({actions: [], effects$: [], reducers: []})});
          expectObservable(effects.resolveNavListItemsFromActions$).toBe('(or|)', {
            o: openSnackBar({message: 'Error creating nav list items', error: new Error('simulated error')}),
            r: resetStatus()
          });
        });
      });
    });
  });

  describe(`when '${readDotFileSucceeded.type}' is dispatched`, () => {
    describe('and dotFileParser.getNavListItemsFromDotSrc succeeds', () => {
      beforeEach(() => {
        dotFileParser.getNavListItemsFromDotSrc.and.returnValue([{id: 'A', label: 'A'}, {id: 'B', label: 'B'}]);
      });

      it(`resolveNavListItemsFromDotSrc$ should return '${resolveNavListItemsSucceeded.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a: readDotFileSucceeded({dotSrc: 'digraph { A->B }'})});
          expectObservable(effects.resolveNavListItemsFromDotSrc$).toBe('b|', {
            b: resolveNavListItemsSucceeded({
              navListItems: [
                {id: 'A', label: 'A'},
                {id: 'B', label: 'B'}]
            })
          });
        });
      });
    });

    describe('and dotFileParser.getNavListItemsFromDotSrc fails', () => {
      beforeEach(() => {
        dotFileParser.getNavListItemsFromDotSrc.and.throwError('simulated error');
      });

      it(`resolveNavListItemsFromDotSrc$ should return '${openSnackBar.type}' and '${resetStatus.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a: readDotFileSucceeded({dotSrc: 'digraph { A->B }'})});
          expectObservable(effects.resolveNavListItemsFromDotSrc$).toBe('(or|)', {
            o: openSnackBar({message: 'Error extracting actions from dot file', error: new Error('simulated error')}),
            r: resetStatus()
          });
        });
      });
    });
  });

  describe(`when '${saveDotFileFromSaveDotFileComponent.type}' is dispatched`, () => {
    let a: SpyObj<any>;
    let text: Promise<string>;

    beforeEach(() => {
      a = createSpyObj('a', ['click']);
      document.createElement.and.returnValue(a);
      store.setState({graphviz: {projectName: 'ngrx-graphviz', dotSrc: 'digraph { A->B }'}});
      spyOn(URL, 'createObjectURL').and.callFake((obj: Blob) => {
        text = obj.text();
        return "blob:http://localhost:9876/9268ee69-2dc8-4711-bdc3-ff778b3b0d74";
      });
      actions$ = of(saveDotFileFromSaveDotFileComponent());
      effects.saveDotFileFromSaveDotFileComponent$.subscribe();
    });

    it('the anchor should be created', () => {
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it("the suggested filename should be 'ngrx-graphviz.dot'", () => {
      expect(a.download).toBe('ngrx-graphviz.dot');
    });

    it("the content of blob should be 'digraph { A->B }'", async () => {
      expect(await text).toEqual("digraph { A->B }");
    });

    it('the anchor should be clicked', () => {
      expect(a.click).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
