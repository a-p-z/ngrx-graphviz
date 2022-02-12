import createSpyObj = jasmine.createSpyObj;

const edgesOn = (typename: string, listener: () => void) => {
  if (typename === 'click') {
    clickOnEdge = listener;
  }
  return edges;
};

const edges = createSpyObj('edges', ['on']);
edges.on.and.callFake(edgesOn);

const nodesOn = (typename: string, listener: () => void) => {
  if (typename === 'click') {
    clickOnNode = listener;
  }
  return nodes;
};

export const nodes = createSpyObj('nodes', ['on', 'style']);
nodes.on.and.callFake(nodesOn);
nodes.style.and.returnValue(nodes);

export const selectAll = (selector: '.node' | '.edge') => {
  return selector === '.node' ? nodes : edges;
}

export let clickOnNode: any;
export let clickOnEdge: any;

export const selection = createSpyObj('selection', ['node']);

export const svg = createSpyObj('svg', ['attr', 'datum', 'selectWithoutDataPropagation', 'transition']);
svg.attr.and.returnValue(svg);
svg.selectWithoutDataPropagation.and.returnValue(selection);
