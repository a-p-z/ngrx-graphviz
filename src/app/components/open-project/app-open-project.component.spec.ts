import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {AppOpenProjectComponent} from "./app-open-project.component";
import {MatIconModule} from "@angular/material/icon";
import {MatIconTestingModule} from "@angular/material/icon/testing";
import {
  openSnackBarFromOpenProjectComponent,
  readProjectFromOpenProjectComponent,
  resetStatusFromOpenProjectComponent
} from "../../actions";
import createSpyObj = jasmine.createSpyObj;

describe("AppOpenProjectComponent", () => {
  const initialState = {graphviz: {}};

  let fixture: ComponentFixture<AppOpenProjectComponent>;
  let component: AppOpenProjectComponent;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppOpenProjectComponent],
      imports: [MatIconModule, MatIconTestingModule],
      providers: [provideMockStore({initialState})]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(AppOpenProjectComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, "dispatch").and.callThrough();
    });
  });

  it("app should be created", () => {
    expect(component).toBeTruthy();
  });

  describe("when status is loading", () => {
    beforeEach(() => {
      store.setState({graphviz: {status: "loading"}});
      fixture.detectChanges();
    });

    it("button should not be disabled", () => {
      expect(fixture.nativeElement.querySelector("button").disabled).toBeTrue();
    });
  });

  [undefined, "loaded"].forEach((status) => {
    describe("when status is not loading", () => {
      beforeEach(() => {
        store.setState({graphviz: {status}});
        fixture.detectChanges();
      });

      it("button should be disabled", () => {
        expect(fixture.nativeElement.querySelector("button").disabled).toBeFalse();
      });
    });
  });

  describe("when project name is defined", () => {
    beforeEach(() => {
      store.setState({graphviz: {projectName: "ngrx-graphviz"}});
      fixture.detectChanges();
    });

    it('button should be visible', () => {
      expect(fixture.nativeElement.querySelector('button').style.visibility).toBe('visible');
    });
  });

  describe('when project name is not defined', () => {
    describe('and status is loading', () => {
      beforeEach(() => {
        store.setState({graphviz: {projectName: undefined, status: 'loading'}});
        fixture.detectChanges();
      });

      it('button should be hidden', () => {
        expect(fixture.nativeElement.querySelector('button').style.visibility).toBe('hidden');
      });
    });

    [undefined, 'loaded'].forEach((status) => {
      describe(`and status is ${status}`, () => {
        beforeEach(() => {
          store.setState({graphviz: {projectName: undefined, status}});
          fixture.detectChanges();
        });

        it('button should be visible', () => {
          expect(fixture.nativeElement.querySelector('button').style.visibility).toBe('visible');
        });
      });
    });
  });

  describe('on file selected', () => {
    describe('when files is not defined', () => {
      let event$: any;

      beforeEach(() => {
        event$ = createSpyObj('event$', ['preventDefault']);
        event$.target = {files: undefined};
        component.onProjectSelected(event$);
      });

      it('event$.preventDefault should be called', () => {
        expect(event$.preventDefault).toHaveBeenCalled();
      });

      it(`'${resetStatusFromOpenProjectComponent.type}' should be dispatch`, () => {
        expect(store.dispatch).toHaveBeenCalledWith(resetStatusFromOpenProjectComponent());
      });

      it(`'${openSnackBarFromOpenProjectComponent.type}' should be dispatch`, () => {
        expect(store.dispatch).toHaveBeenCalledWith(openSnackBarFromOpenProjectComponent({message: 'No files selected'}));
      });
    });

    describe('when files is defined', () => {
      describe('and tsconfig.json is not present', () => {
        let event$: any;

        beforeEach(() => {
          const files = [
            {webkitRelativePath: 'ngrx-graphviz/.gitignore', name: '.gitignore'},
            {webkitRelativePath: 'ngrx-graphviz/node_modules/@ngrx/effects/index.d.ts', name: 'index.d.ts'},
            {webkitRelativePath: 'ngrx-graphviz/node_modules/@ngrx/store/index.d.ts', name: 'index.d.ts'},
            {webkitRelativePath: 'ngrx-graphviz/src/app/app.component.html', name: 'app.component.html'},
            {webkitRelativePath: 'ngrx-graphviz/src/app/app.component.spec.ts', name: 'app.component.spec.ts'},
            {webkitRelativePath: 'ngrx-graphviz/src/app/app.component.ts', name: 'app.component.ts'}];
          event$ = createSpyObj('event$', ['preventDefault']);
          event$.target = {files};
          component.onProjectSelected(event$);
        });

        it('event$.preventDefault should be called', () => {
          expect(event$.preventDefault).toHaveBeenCalled();
        });

        it(`'${resetStatusFromOpenProjectComponent.type}' should be dispatch`, () => {
          expect(store.dispatch).toHaveBeenCalledWith(resetStatusFromOpenProjectComponent());
        });

        it(`'${openSnackBarFromOpenProjectComponent.type}' should be dispatch`, () => {
          expect(store.dispatch).toHaveBeenCalledWith(openSnackBarFromOpenProjectComponent({message: 'tsconfing.json not found'}));
        });
      });

      describe('and tsconfig.json is present', () => {
        let event$: any;

        beforeEach(() => {
          const files = [
            {webkitRelativePath: 'ngrx-graphviz/.gitignore', name: '.gitignore'},
            {webkitRelativePath: 'ngrx-graphviz/node_modules/@ngrx/effects/index.d.ts', name: 'index.d.ts'},
            {webkitRelativePath: 'ngrx-graphviz/node_modules/@ngrx/store/index.d.ts', name: 'index.d.ts'},
            {webkitRelativePath: 'ngrx-graphviz/src/app/app.component.html', name: 'app.component.html'},
            {webkitRelativePath: 'ngrx-graphviz/src/app/app.component.spec.ts', name: 'app.component.spec.ts'},
            {webkitRelativePath: 'ngrx-graphviz/src/app/app.component.ts', name: 'app.component.ts'},
            {webkitRelativePath: 'ngrx-graphviz/tsconfig.json', name: 'tsconfig.json'}];
          event$ = createSpyObj('event$', ['preventDefault']);
          event$.target = {files};
          component.onProjectSelected(event$);
        });

        it('event$.preventDefault should be called', () => {
          expect(event$.preventDefault).toHaveBeenCalled();
        });

        it(`'${readProjectFromOpenProjectComponent.type}' should be dispatch`, () => {
          expect(store.dispatch).toHaveBeenCalledWith(readProjectFromOpenProjectComponent({
            projectName: 'ngrx-graphviz', files: [
              {webkitRelativePath: 'ngrx-graphviz/node_modules/@ngrx/effects/index.d.ts', name: 'index.d.ts'},
              {webkitRelativePath: 'ngrx-graphviz/node_modules/@ngrx/store/index.d.ts', name: 'index.d.ts'},
              {webkitRelativePath: 'ngrx-graphviz/src/app/app.component.ts', name: 'app.component.ts'},
              {webkitRelativePath: 'ngrx-graphviz/tsconfig.json', name: 'tsconfig.json'}] as File[]
          }));
        });
      });
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
