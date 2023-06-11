import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Graphviz, graphviz} from 'd3-graphviz';
import {BaseType, select, selectAll, Selection} from 'd3-selection';
import {Store} from '@ngrx/store';
import {filter, Subject} from 'rxjs';
import {selectDotSrc} from 'src/app/selectors'
import {takeUntil} from 'rxjs/operators';
import {
  changeStatusFromGraphvizComponent,
  openSnackBarFromGraphvizComponent,
  resetStatusFromGraphvizComponent,
  transitionToNodeFromNavListComponent,
} from 'src/app/actions';
import {zoomIdentity} from 'd3-zoom'
import {ResizedEvent} from 'angular-resize-event';
import {Actions, ofType} from '@ngrx/effects';

@Component({
  selector: 'app-graphviz',
  templateUrl: './app-graphviz.component.html',
  styleUrls: ['./app-graphviz.component.scss']
})
export class AppGraphvizComponent implements AfterViewInit, OnDestroy, OnInit {

  // for testing purpose
  private readonly d3_graphviz = graphviz;

  private readonly selectAll = selectAll;
  private readonly zoomIdentity = zoomIdentity;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  private graphviz?: Graphviz<BaseType, any, BaseType, any>;
  private graph?: Selection<Element, any, Element, any>;
  private svg?: Selection<BaseType, any, Element, any>;
  private width = 0;

  constructor(private actions$: Actions, private store: Store) {
  }

  ngOnInit(): void {
    this.store.select(selectDotSrc).pipe(
      takeUntil(this.destroy$),
      filter((dotSrc) => !!dotSrc))
      .subscribe((dotSrc) => this.graphviz?.renderDot(dotSrc as string));

    this.actions$.pipe(
      takeUntil(this.destroy$),
      ofType(transitionToNodeFromNavListComponent.type))
      .subscribe(({id}) => this.transitionToNode(id));
  }

  ngAfterViewInit(): void {
    this.graph = select('#graph');
    this.graphviz = this.d3_graphviz('#graph', {useWorker: true})
      .addImage('assets/store.svg', '48px', '48px')
      .on('renderEnd', () => this.renderEnd())
      .on('end', () => this.end())
      .onerror((error) => this.onError(error));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  onResized(event$: ResizedEvent) {
    if (!this.svg) {
      return;
    }

    this.width = event$.newRect.width;
    const height = event$.newRect.height;
    this.svg
      .attr('width', `${this.width - 10}px`)
      .attr('height', `${height - 10}px`)
      .attr('viewBox', `0 0 ${this.width - 10} ${height - 10}`);

    this.svg.datum().attributes.width = `${this.width - 10}px`;
    this.svg.datum().attributes.height = `${height - 10}px`;
    this.svg.datum().attributes.viewBox = `0 0 ${this.width - 10} ${height - 10}`;
  }

  // when the rendering preparation ends.
  private renderEnd(): void {
    this.svg = this.graph?.selectWithoutDataPropagation('svg');

    this.selectAll('.node')
      .style('filter', 'drop-shadow(0px 1px 5px rgba(0, 0, 0, .2))')
      .style('stroke-width', '0');
  }

  private transitionToNode(id: string): void {
    const element = this.svg?.selectWithoutDataPropagation(`[id='${id}']`)?.node();
    if (!element) {
      this.store.dispatch(openSnackBarFromGraphvizComponent({message: `${id} not found`}));
      return;
    }

    const zoomBehavior = this.graphviz?.zoomBehavior();
    if (!zoomBehavior) {
      this.store.dispatch(openSnackBarFromGraphvizComponent({message: 'Zoom behavior not defined'}));
      return;
    }

    const {x, y, height} = (element as SVGGraphicsElement).getBBox();
    const transform = this.zoomIdentity.translate(-x + this.width * 3 / 8, -y + height).scale(1);
    this.svg?.transition().duration(1000).call((zoomBehavior as any).transform, transform);
  }

  // when the graphviz renderer has finished all actions.
  private end(): void {
    this.store.dispatch(changeStatusFromGraphvizComponent());
    this.selectAll('.node').on('click', (event$) => this.onNodeClick(event$));
    this.selectAll('.edge').on('click', (event$) => this.onEdgeClick(event$));
  }

  // when the layout computation encounters an error
  private onError(error: any): void {
    this.store.dispatch(openSnackBarFromGraphvizComponent({message: 'Error rendering dot src', error}));
    this.store.dispatch(resetStatusFromGraphvizComponent());
  }

  private onNodeClick(event$: any) {
    const id = event$.currentTarget.id.split('-').reverse()[0];
    this.transitionToNode(id);
  }

  private onEdgeClick(event$: any) {
    const id = event$.currentTarget.getElementsByTagName('title')[0].textContent.split('->').reverse()[0];
    this.transitionToNode(id);
  }
}
