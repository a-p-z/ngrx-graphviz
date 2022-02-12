import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {AppOpenDotFileComponent} from "./app-open-dot-file.component";
import {MatIconModule} from "@angular/material/icon";
import {MatIconTestingModule} from "@angular/material/icon/testing";
import {MockPipe} from "ng-mocks";
import {FilterPipe} from "../../pipes/filter.pipe";
import {HighlightPipe} from "../../pipes/highlight.pipe";
import {
  openSnackBarFromOpenFileComponent,
  readDotFileFromOpenDotFileComponent,
  resetStatusFromOpenDotFileComponent
} from "../../actions";
import createSpyObj = jasmine.createSpyObj;

describe('AppOpenDotFileComponent', () => {
  const initialState = {graphviz: {}};

  let fixture: ComponentFixture<AppOpenDotFileComponent>;
  let component: AppOpenDotFileComponent;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppOpenDotFileComponent, MockPipe(FilterPipe), MockPipe(HighlightPipe)],
      imports: [MatIconModule, MatIconTestingModule],
      providers: [provideMockStore({initialState})]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(AppOpenDotFileComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch').and.callThrough();
    });
  });

  it('app should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('when status is loading', () => {
    beforeEach(() => {
      store.setState({graphviz: {status: 'loading'}});
      fixture.detectChanges();
    });

    it('button should not be disabled', () => {
      expect(fixture.nativeElement.querySelector('button').disabled).toBeTrue();
    });
  });

  [undefined, 'loaded'].forEach((status) => {
    describe('when status is not loading', () => {
      beforeEach(() => {
        store.setState({graphviz: {status}});
        fixture.detectChanges();
      });

      it('button should be disabled', () => {
        expect(fixture.nativeElement.querySelector('button').disabled).toBeFalse();
      });
    });
  });

  describe('when project name is defined', () => {
    beforeEach(() => {
      store.setState({graphviz: {projectName: 'ngrx-graphviz'}});
      fixture.detectChanges();
    });

    it('button should be hidden', () => {
      expect(fixture.nativeElement.querySelector('button').style.visibility).toBe('hidden');
    });
  });

  describe('when project name is not defined', () => {
    beforeEach(() => {
      store.setState({graphviz: {projectName: undefined}});
      fixture.detectChanges();
    });

    it('button should be visible', () => {
      expect(fixture.nativeElement.querySelector('button').style.visibility).toBe('visible');
    });
  });

  describe('on file selected', () => {
    [undefined, []].forEach((files) => {
      describe('when files are not 1', () => {
        let event$: any;

        beforeEach(() => {
          event$ = createSpyObj('event$', ['preventDefault']);
          event$.target = {files};
          component.onFileSelected(event$);
        });

        it('event$.preventDefault should be called', () => {
          expect(event$.preventDefault).toHaveBeenCalled();
        });

        it(`'${resetStatusFromOpenDotFileComponent.type}' should be dispatch`, () => {
          expect(store.dispatch).toHaveBeenCalledWith(resetStatusFromOpenDotFileComponent());
        });

        it(`'${openSnackBarFromOpenFileComponent.type}' should be dispatch`, () => {
          expect(store.dispatch).toHaveBeenCalledWith(openSnackBarFromOpenFileComponent({message: 'No file selected'}));
        });
      });
    });

    describe('when files are 1', () => {
      const file = new File([], 'test');
      let event$: any;

      beforeEach(() => {
        event$ = createSpyObj('event$', ['preventDefault']);
        event$.target = {files: [file]};
        component.onFileSelected(event$);
      });

      it('event$.preventDefault should be called', () => {
        expect(event$.preventDefault).toHaveBeenCalled();
      });

      it(`'${readDotFileFromOpenDotFileComponent.type}' should be dispatch`, () => {
        expect(store.dispatch).toHaveBeenCalledWith(readDotFileFromOpenDotFileComponent({file}));
      });
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
