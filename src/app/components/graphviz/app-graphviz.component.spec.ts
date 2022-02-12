import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {AppGraphvizComponent} from "./app-graphviz.component";
import *  as d3_graphviz from "d3-graphviz";
import {provideMockActions} from "@ngrx/effects/testing";
import {Observable, of} from "rxjs";
import {TypedAction} from "@ngrx/store/src/models";
import {
  openSnackBarFromGraphvizComponent,
  renderSucceededFromGraphvizComponent,
  resetStatusFromGraphvizComponent,
  transitionToNodeFromNavListComponent
} from "../../actions";
import {ResizedEvent} from "angular-resize-event";
import {graphviz, onerror} from "./spy-d3-graphviz";
import {clickOnEdge, clickOnNode, nodes, selectAll, selection, svg} from "./spy-d3-selection";
import {zoomIdentity} from "./spy-zoom-identity";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import anything = jasmine.anything;

describe("AppGraphvizComponent", () => {
  const initialState = {graphviz: {}};

  let fixture: ComponentFixture<AppGraphvizComponent>;
  let actions: Observable<TypedAction<any>>;
  let component: any;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppGraphvizComponent],
      providers: [provideMockActions(() => actions), provideMockStore({initialState})]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(AppGraphvizComponent);
      component = fixture.componentInstance;

      spyOn(component, "selectAll").and.callFake(selectAll);
      component.zoomIdentity = zoomIdentity;

      store = TestBed.inject(MockStore);
      spyOn(store, "dispatch").and.callThrough();

      spyOn(d3_graphviz, "graphviz").and.returnValue(graphviz);
    });
  });

  it("app should be created", () => {
    expect(component).toBeTruthy();
  });

  describe("when dotSrc is truthy", () => {
    beforeEach(() => {
      fixture.detectChanges();
      store.setState({graphviz: {dotSrc: "diagram {A;B;A->B;}"}});
    });

    it("dotSrc should be rendered", () => {
      expect(component.graphviz.renderDot).toHaveBeenCalledWith("diagram {A;B;A->B;}");
    });
  });

  describe(`when '${transitionToNodeFromNavListComponent.type}' action is dispatched`, () => {
    beforeEach(() => {
      spyOn(component, 'transitionToNode');
      actions = of(transitionToNodeFromNavListComponent({id: '42'}));
      fixture.detectChanges();
    });

    it('transitionToNode should be called', () => {
      expect(component.transitionToNode).toHaveBeenCalledWith('42');
    });
  });

  describe('after view init', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('graph is truthy', () => {
      expect(component.graph).toBeTruthy();
    });

    it('a new graphviz renderer instance should be created', () => {
      expect(d3_graphviz.graphviz).toHaveBeenCalledWith('#graph', {useWorker: true});
    });

    it('assets/store.svg should be added', () => {
      expect(component.graphviz.addImage).toHaveBeenCalledWith('assets/store.svg', '48px', '48px');
    });

    it('on renderEnd should be defined', () => {
      expect(component.graphviz.on).toHaveBeenCalledWith('renderEnd', anything())
    });

    it('on end should be defined', () => {
      expect(component.graphviz.on).toHaveBeenCalledWith('end', anything())
    });

    it('onerror should be defined', () => {
      expect(component.graphviz.onerror).toHaveBeenCalledWith(anything())
    });
  });

  describe('on destroy', () => {
    beforeEach(() => {
      fixture.destroy();
    });

    it('destroy$ is closed', () => {
      expect(component.destroy$.closed).toBeTrue();
    });
  });

  describe('when the div is resized', () => {
    describe('and svg is defined', () => {
      let attributes = {};

      beforeEach(() => {
        component.svg = svg;
        component.svg.datum.and.returnValue({attributes});
        component.onResized({newRect: {width: 1024, height: 512}} as ResizedEvent);
      });

      it('width should be updated', () => {
        expect(component.width).toBe(1024);
      });

      it('svg with should be updated', () => {
        expect(component.svg.attr).toHaveBeenCalledWith('width', '1014px');
      });

      it('svg height should be updated', () => {
        expect(component.svg.attr).toHaveBeenCalledWith('height', '502px');
      });

      it('svg viewBox should be updated', () => {
        expect(component.svg.attr).toHaveBeenCalledWith('viewBox', '0 0 1014 502');
      });

      it('svg.datum().attributes should be updated', () => {
        expect(attributes).toEqual({width: '1014px', height: '502px', viewBox: '0 0 1014 502'});
      });
    });

    describe('and svg is not defined ', () => {
      beforeEach(() => {
        component.svg = undefined;
        component.onResized({newRect: {width: 1024, height: 512}} as ResizedEvent);
      });

      it('width should be updated', () => {
        expect(component.width).toBe(0);
      });
    });
  });

  describe('when the rendering preparation ends', () => {
    beforeEach(() => {
      fixture.detectChanges();
      store.setState({graphviz: {dotSrc: 'diagram {A;B;A->B;}'}});
    });

    it('svg should be initialized', () => {
      expect(component.svg).toBeDefined();
    });

    it('drop-shadow should be set for all the nodes', () => {
      expect(nodes.style).toHaveBeenCalledWith('filter', 'drop-shadow(0px 1px 5px rgba(0, 0, 0, .2))');
    });

    it('stroke-width should be set for all the nodes', () => {
      expect(nodes.style).toHaveBeenCalledWith('stroke-width', '0');
    });
  });

  describe('on transition to node', () => {
    beforeEach(() => {
      component.svg = svg;
    });

    describe('when the node is found', () => {
      let element: SpyObj<SVGGraphicsElement>;

      beforeEach(() => {
        element = createSpyObj('element', ['getBBox']);
        element.getBBox.and.returnValue({x: 640, y: 480, height: 522} as DOMRect);
        selection.node.and.returnValue(element);
      });

      describe('and zoom behavior is defined', () => {
        let transition: SpyObj<any>;
        let zoomBehavior: SpyObj<any>;

        beforeEach(() => {
          zoomBehavior = createSpyObj('zoomBehavior', ['transform']);
          transition = createSpyObj('transition', ['call', 'duration']);
          transition.duration.and.returnValue(transition);
          component.svg.transition.and.returnValue(transition);
          component.width = 1818.6666666666667;
          fixture.detectChanges();
          component.graphviz.zoomBehavior.and.returnValue(zoomBehavior);
          component.transitionToNode('42');
        });

        it('the translation should be defined', () => {
          expect(component.zoomIdentity.translate).toHaveBeenCalledWith(42, 42);
        });

        it('the zoom scale should be defined', () => {
          expect(component.zoomIdentity.scale).toHaveBeenCalledWith(1);
        });

        it('transition duration should be set', () => {
          expect(transition.duration).toHaveBeenCalledWith(1000);
        });

        it('transform should be called', () => {
          expect(transition.call).toHaveBeenCalledWith(zoomBehavior.transform, component.zoomIdentity);
        });
      });

      describe('and zoom behavior is not defined', () => {
        beforeEach(() => {
          fixture.detectChanges();
          component.graphviz.zoomBehavior.and.returnValue(undefined);
          component.transitionToNode('42');
        });

        it(`'${openSnackBarFromGraphvizComponent.type}' should be dispatched`, () => {
          expect(store.dispatch).toHaveBeenCalledWith(openSnackBarFromGraphvizComponent({message: 'Zoom behavior not defined'}));
        });
      });
    });

    describe('when the node is not found', () => {
      beforeEach(() => {
        selection.node.and.returnValue(undefined);
        component.transitionToNode('42');
      });

      it(`'${openSnackBarFromGraphvizComponent.type}' should be dispatched`, () => {
        expect(store.dispatch).toHaveBeenCalledWith(openSnackBarFromGraphvizComponent({message: '42 not found'}));
      });
    });
  });

  describe('when the graphviz renderer has finished all actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
      store.setState({graphviz: {dotSrc: 'diagram {A;B;A->B;}'}});
    });

    it(`'${renderSucceededFromGraphvizComponent.type}' should be dispatched`, () => {
      expect(store.dispatch).toHaveBeenCalledWith(renderSucceededFromGraphvizComponent())
    });

    it('a listener should should be added on .node selection for click event', () => {
      expect(nodes.on).toHaveBeenCalledWith('click', anything());
    });

    it('a listener should should be added on .edge selection for click event', () => {
      expect(nodes.on).toHaveBeenCalledWith('click', anything());
    });
  });

  describe('when the layout computation encounters an error', () => {
    beforeEach(() => {
      fixture.detectChanges();
      onerror('error message');
      store.setState({graphviz: {dotSrc: 'diagram {A;B;A->B;}'}});
    });

    it(`'${openSnackBarFromGraphvizComponent.type}' should be dispatched`, () => {
      expect(store.dispatch).toHaveBeenCalledWith(openSnackBarFromGraphvizComponent({
        message: 'Error rendering dot src',
        error: 'error message'
      }));
    });

    it(`'${resetStatusFromGraphvizComponent.type}' should be dispatched`, () => {
      expect(store.dispatch).toHaveBeenCalledWith(resetStatusFromGraphvizComponent());
    });
  });

  describe('when click on a node', () => {
    beforeEach(() => {
      spyOn(component, 'transitionToNode');
      fixture.detectChanges();
      store.setState({graphviz: {dotSrc: 'diagram {A;B;A->B;}'}});
      clickOnNode({currentTarget: {id: '24-42'}});
    });

    it('transitionToNode should be called ', () => {
      expect(component.transitionToNode).toHaveBeenCalledWith('42');
    });
  });

  describe('when click on an edge', () => {
    beforeEach(() => {
      spyOn(component, 'transitionToNode');
      const currentTarget = createSpyObj('currentTarget', ['getElementsByTagName']);
      currentTarget.getElementsByTagName.and.returnValue([{textContent: '24->42'}]);
      fixture.detectChanges();
      store.setState({graphviz: {dotSrc: 'diagram {A;B;A->B;}'}});
      clickOnEdge({currentTarget});
    });

    it('transitionToNode should be called ', () => {
      expect(component.transitionToNode).toHaveBeenCalledWith('42');
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
