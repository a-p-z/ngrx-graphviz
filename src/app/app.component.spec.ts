import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppComponent} from "./app.component";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MockComponent} from "ng-mocks";
import {AppGraphvizComponent} from "./components/graphviz/app-graphviz.component";
import {AppNavListComponent} from "./components/nav-list/app-nav-list.component";
import {AppOpenDotFileComponent} from "./components/open-dot-file/app-open-dot-file.component";
import {AppOpenProjectComponent} from "./components/open-project/app-open-project.component";
import {AppSaveDotFileComponent} from "./components/save-dot-file/app-save-dot-file.component";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('AppComponent', () => {
  const initialState = {graphviz: {}};

  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockComponent(AppGraphvizComponent),
        MockComponent(AppNavListComponent),
        MockComponent(AppOpenDotFileComponent),
        MockComponent(AppOpenProjectComponent),
        MockComponent(AppSaveDotFileComponent)],
      imports: [
        MatProgressBarModule,
        MatSidenavModule,
        MatToolbarModule,
        NoopAnimationsModule],
      providers: [provideMockStore({initialState})]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(AppComponent);
    });
  });

  it('app should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mat-progress-bar should be hidden', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-progress-bar')?.getAttribute('style')).toBe('visibility: hidden;');
  });

  it('app-open-dot-file should be present', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-open-dot-file')).not.toBeNull();
  });

  it('app-open-project should be present', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-open-project')).not.toBeNull();
  });

  it('app-graphviz should be present', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-graphviz')).not.toBeNull();
  });

  it('app-save-dot-file should not be present', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-save-dot-file')).toBeNull();
  });

  describe('when a dot file or a project is loading', () => {
    beforeEach(() => {
      const store = TestBed.inject(MockStore);
      store.setState({graphviz: {status: 'loading'}});
    });

    it('mat-progress-bar should be visible', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-progress-bar')?.getAttribute('style')).toBe('visibility: visible;');
    });

    it('app-open-dot-file should be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-open-dot-file')).not.toBeNull();
    });

    it('app-open-project should be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-open-project')).not.toBeNull();
    });

    it('app-graphviz should be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-graphviz')).not.toBeNull();
    });

    it('app-save-dot-file should not be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-save-dot-file')).toBeNull();
    });
  });

  describe('when a project has been opened', () => {
    beforeEach(() => {
      const store = TestBed.inject(MockStore);
      store.setState({graphviz: {projectName: 'test', status: 'loaded'}});
    });

    it('mat-progress-bar should be hidden', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-progress-bar')?.getAttribute('style')).toBe('visibility: hidden;');
    });

    it('app-open-dot-file should not be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-open-dot-file')).toBeNull();
    });

    it('app-open-project should not be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-open-project')).toBeNull();
    });

    it('app-graphviz should be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-graphviz')).not.toBeNull();
    });

    it('app-save-dot-file should be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-save-dot-file')).not.toBeNull();
    });
  });

  describe('when a dot file has been opened', () => {
    beforeEach(() => {
      const store = TestBed.inject(MockStore);
      store.setState({graphviz: {status: 'loaded'}});
    });

    it('mat-progress-bar should be hidden', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-progress-bar')?.getAttribute('style')).toBe('visibility: hidden;');
    });

    it('app-open-dot-file should not be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-open-dot-file')).toBeNull();
    });

    it('app-open-project should not be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-open-project')).toBeNull();
    });

    it('app-graphviz should be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-graphviz')).not.toBeNull();
    });

    it('app-save-dot-file should not be present', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-save-dot-file')).toBeNull();
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
