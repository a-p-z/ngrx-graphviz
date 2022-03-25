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
  changeNavListItemsFromOpenDotFile,
  changeNavListItemsFromParseProject,
  changeSrcDotFromCreateDotSrc,
  changeSrcDotFromReadDotSrc,
  createDotSrcFromParseProject,
  openSnackBar,
  openSnackBarFromGraphvizComponent,
  openSnackBarFromOpenFileComponent,
  openSnackBarFromOpenProjectComponent,
  parseProjectFromReadProject,
  readDotFileFromOpenDotFileComponent,
  readProjectFromOpenProjectComponent,
  resetStatus,
  resolveNavListItemsFromOpenDotFile,
  resolveNavListItemsFromParseProject,
  saveDotFileFromSaveDotFileComponent
} from "./actions";
import {TestScheduler} from "rxjs/testing";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe("Effects", () => {
  const initialState = {};
  const r = resetStatus();

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

  describe(`when '${createDotSrcFromParseProject.type}' is dispatched`, () => {
    const a = createDotSrcFromParseProject({actions: [], effects$: [], reducers: []});
    const b = changeSrcDotFromCreateDotSrc({dotSrc: "digraph { A->B }"});
    const o = openSnackBar({message: "Error creating dot src", error: new Error("simulated error")});

    describe("and dotFileParser.createDotSrc succeeds", () => {
      beforeEach(() => {
        dotFileParser.createDotSrc.and.returnValue("digraph { A->B }");
      });

      it(`createDotSrc$ should return '${b.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot("a|", {a});
          expectObservable(effects.createDotSrc$).toBe("b|", {b});
        });
      });
    });

    describe("and dotFileParser.createDotSrc fails", () => {
      beforeEach(() => {
        dotFileParser.createDotSrc.and.throwError("simulated error");
      });

      it(`createDotSrc$ should return '${o.type}' and '${r.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot("a|", {a});
          expectObservable(effects.createDotSrc$).toBe("(or|)", {o, r});
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

  describe(`when '${parseProjectFromReadProject.type}' is dispatched`, () => {
    const tsconfig = {path: "tsconfig.json", text: ''};
    const a = parseProjectFromReadProject({sourceFiles: [tsconfig]});
    const b = createDotSrcFromParseProject({actions: [], effects$: [], reducers: []});
    const c = resolveNavListItemsFromParseProject({actions: []});
    const o = openSnackBar({message: 'Error analyzing project', error: new Error('simulated error')});

    describe('and projectParser.parse succeeds', () => {
      beforeEach(() => {
        projectParser.parse.and.returnValue({actions: [], effects$: [], reducers: []});
      });

      it(`parseProject$ should return '${b.type}' and '${c.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a---|', {a});
          expectObservable(effects.parseProject$).toBe('(bc)|', {b, c});
        });
      });
    });

    describe('and projectReader.parse fails', () => {
      beforeEach(() => {
        projectParser.parse.and.throwError('simulated error');
      });

      it(`parseProject$ should return '${o.type}' and '${r.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a});
          expectObservable(effects.parseProject$).toBe('(or|)', {o, r});
        });
      });
    });
  });

  describe(`when '${readDotFileFromOpenDotFileComponent.type}' is dispatched`, () => {
    const file = new File([], 'test');
    const dotSrc = 'digraph { A->B }';
    const error = new Error('simulated error');
    const a = readDotFileFromOpenDotFileComponent({file});
    const b = changeSrcDotFromReadDotSrc({dotSrc});
    const c = resolveNavListItemsFromOpenDotFile({dotSrc});
    const o = openSnackBar({message: 'Error reading dot file', error});

    describe('and textFileReader.read succeeds', () => {
      it(`readDotFile$ should return '${b.type}' and '${c.type}'`, () => {
        testScheduler.run(({cold, hot, expectObservable}) => {
          actions$ = hot('a|', {a});
          textFileReader.read.and.returnValue(cold('a---|', {a: dotSrc}));
          expectObservable(effects.readDotFile$).toBe('(bc)|', {b, c});
        });
      });
    });

    describe('and textFileReader.read fails', () => {
      it(`readDotFile$ should return '${o.type}' and '${r.type}'`, () => {
        testScheduler.run(({cold, hot, expectObservable}) => {
          actions$ = hot('a|', {a: readDotFileFromOpenDotFileComponent({file})});
          textFileReader.read.and.returnValue(cold('#|', {}, error));
          expectObservable(effects.readDotFile$).toBe('(or|)', {o, r});
        });
      });
    });
  });

  describe(`when '${readProjectFromOpenProjectComponent.type}' is dispatched`, () => {
    const files = [{webkitRelativePath: 'test/file1'}, {webkitRelativePath: 'test/file2'}] as File[];
    const sourceFile1 = {path: 'test/file1', text: 'file 1 content'};
    const sourceFile2 = {path: 'test/file2', text: 'file 2 content'};
    const error = new Error('simulated error');
    const a = readProjectFromOpenProjectComponent({projectName: 'ngrx-graphviz', files});
    const b = parseProjectFromReadProject({sourceFiles: [sourceFile1, sourceFile2]});
    const o = openSnackBar({message: 'Error reading project', error});

    describe('and textFileReader.read succeeds', () => {
      describe('and projectParser.createSourceFile succeeds', () => {
        beforeEach(() => {
          projectParser.createSourceFile.and.callFake((path, text) => {
            return {path, text}
          });
        });

        it(`readProject$ should return '${b.type}'`, () => {
          testScheduler.run(({cold, hot, expectObservable}) => {
            actions$ = hot('a|', {a});
            textFileReader.read.and.returnValues(cold('a|', {a: 'file 1 content'}), cold('a|', {a: 'file 2 content'}));
            expectObservable(effects.readProject$).toBe('((b|))', {b});
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

        it(`readProject$ should return '${o.type}' and '${r.type}'`, () => {
          testScheduler.run(({cold, hot, expectObservable}) => {
            actions$ = hot('a|', {a});
            textFileReader.read.and.returnValues(cold('a|', {a: 'file 1 content'}), cold('a|', {a: 'file 2 content'}));
            expectObservable(effects.readProject$).toBe('(or|)', {o, r});
          });
        });
      });
    });

    describe('and textFileReader.read fails', () => {
      it(`readProject$ should return '${o.type}' and '${r.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('#|', {}, error);
          expectObservable(effects.readProject$).toBe('(or|)', {o, r});
        });
      });
    });
  });

  describe(`when '${resolveNavListItemsFromOpenDotFile.type}' is dispatched`, () => {
    const a = resolveNavListItemsFromOpenDotFile({dotSrc: 'digraph { A->B }'});
    const b = changeNavListItemsFromOpenDotFile({navListItems: [{id: 'A', label: 'A'}, {id: 'B', label: 'B'}]});
    const o = openSnackBar({message: 'Error extracting actions from dot file', error: new Error('simulated error')});

    describe('and dotFileParser.getNavListItemsFromDotSrc succeeds', () => {
      beforeEach(() => {
        dotFileParser.getNavListItemsFromDotSrc.and.returnValue([{id: 'A', label: 'A'}, {id: 'B', label: 'B'}]);
      });

      it(`resolveNavListItemsFromOpenDotFile$ should return '${b.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a});
          expectObservable(effects.resolveNavListItemsFromOpenDotFile$).toBe('b|', {b});
        });
      });
    });

    describe('and dotFileParser.getNavListItemsFromDotSrc fails', () => {
      beforeEach(() => {
        dotFileParser.getNavListItemsFromDotSrc.and.throwError('simulated error');
      });

      it(`resolveNavListItemsFromOpenDotFile$ should return '${o.type}' and '${r.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a});
          expectObservable(effects.resolveNavListItemsFromOpenDotFile$).toBe('(or|)', {o, r});
        });
      });
    });
  });

  describe(`when '${resolveNavListItemsFromParseProject.type}' is dispatched`, () => {
    const a = resolveNavListItemsFromParseProject({actions: []});
    const b = changeNavListItemsFromParseProject({navListItems: []});
    const o = openSnackBar({message: 'Error creating nav list items', error: new Error('simulated error')});

    describe('and dotFileParser.getNavListItemsFromActions succeeds', () => {
      beforeEach(() => {
        dotFileParser.getNavListItemsFromActions.and.returnValue([]);
      });

      it(`resolveNavListItemsFromOpenProject$ should return '${b.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a});
          expectObservable(effects.resolveNavListItemsFromOpenProject$).toBe('b|', {b});
        });
      });
    });

    describe('and dotFileParser.getNavListItemsFromActions fails', () => {
      beforeEach(() => {
        dotFileParser.getNavListItemsFromActions.and.throwError('simulated error');
      });

      it(`resolveNavListItemsFromOpenProject$ should return '${o.type}' and '${r.type}'`, () => {
        testScheduler.run(({hot, expectObservable}) => {
          actions$ = hot('a|', {a});
          expectObservable(effects.resolveNavListItemsFromOpenProject$).toBe('(or|)', {o, r});
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
      effects.saveDotFile$.subscribe();
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
