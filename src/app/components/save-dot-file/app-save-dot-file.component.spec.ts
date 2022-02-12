import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {AppSaveDotFileComponent} from "./app-save-dot-file.component";
import {MatIconModule} from "@angular/material/icon";
import {saveDotFileFromSaveDotFileComponent} from "../../actions";

describe('AppSaveDotFileComponent', () => {
  const initialState = {graphviz: {}};

  let fixture: ComponentFixture<AppSaveDotFileComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppSaveDotFileComponent],
      imports: [MatIconModule],
      providers: [provideMockStore({initialState})]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(AppSaveDotFileComponent);
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch').and.callThrough();
    });
  });

  it('app should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('on click', () => {
    beforeEach(() => {
      fixture.nativeElement.querySelector("button").click();
    });

    it(`'${saveDotFileFromSaveDotFileComponent.type}' should be dispatched`, () => {
      expect(store.dispatch).toHaveBeenCalledWith(saveDotFileFromSaveDotFileComponent())
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
