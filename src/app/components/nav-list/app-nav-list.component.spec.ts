import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {AppNavListComponent} from "./app-nav-list.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {MockPipe} from "ng-mocks";
import {FilterPipe} from "../../pipes/filter.pipe";
import {HighlightPipe} from "../../pipes/highlight.pipe";
import {MatListModule} from "@angular/material/list";
import {transitionToNodeFromNavListComponent} from "../../actions";

describe('AppNavListComponent', () => {
  const initialState = {graphviz: {}};

  let fixture: ComponentFixture<AppNavListComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppNavListComponent,
        MockPipe(FilterPipe, (array) => array),
        MockPipe(HighlightPipe, (value) => value)],
      imports: [FormsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, NoopAnimationsModule],
      providers: [provideMockStore({initialState})]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(AppNavListComponent);
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch').and.callThrough();
    });
  });

  it('app should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('when filter text is blank', () => {
    beforeEach(() => {
      fixture.componentInstance.filterText = '';
      fixture.detectChanges();
    });

    it('clear should not be present', () => {
      expect(fixture.nativeElement.querySelector('#clear')).toBeFalsy();
    });
  });

  describe('when filter text is not blank', () => {
    beforeEach(() => {
      fixture.componentInstance.filterText = 'blablabla';
      fixture.detectChanges();
    });

    it('clear should be present', () => {
      expect(fixture.nativeElement.querySelector('#clear')).toBeTruthy();
    });

    describe('and click on clear', () => {
      beforeEach(() => {
        fixture.nativeElement.querySelector('#clear').click();
        fixture.detectChanges();
      });

      it('filter text should be blank', () => {
        expect(fixture.componentInstance.filterText).toBe('');
      });

      it('clear should not be present', () => {
        expect(fixture.nativeElement.querySelector('#clear')).toBeFalsy();
      });
    });
  });

  describe('when navListItems', () => {
    beforeEach(() => {
      store.setState({
        graphviz: {
          navListItems: [
            {id: '1', label: 'nav list item 1'},
            {id: '2', label: 'nav list item 2'},]
        }
      });
      fixture.detectChanges();
    });

    it('nav list items should be present', () => {
      expect(fixture.nativeElement.querySelectorAll('mat-list-item')).toHaveSize(2);
    });

    describe('and click on a nav list item', () => {
      beforeEach(() => {
        fixture.nativeElement.querySelector('mat-list-item>span>span.full-width').click();
      });

      it(`'${transitionToNodeFromNavListComponent.type}' should be dispatched`, () => {
        expect(store.dispatch).toHaveBeenCalledWith(transitionToNodeFromNavListComponent({id: '1'}))
      });
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
