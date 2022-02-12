import createSpyObj = jasmine.createSpyObj;

const on = (typename: string, callback: () => void) => {
  if (typename === 'renderEnd') {
    renderEnd = callback as () => void;
  }
  if (typename === 'end') {
    end = callback as () => void;
  }
  return graphviz;
};

const onError= (callback: (errorMessage: any) => void) => {
  onerror = callback;
  return graphviz;
};

const renderDot = () => {
  renderEnd();
  end();
};

let end: () => void;
let renderEnd: () => void;

export let onerror: (errorMessage: any) => void;

export const graphviz = createSpyObj('graphviz', ['addImage', 'on', 'onerror', 'renderDot', 'zoomBehavior']);
graphviz.addImage.and.returnValue(graphviz);
graphviz.on.and.callFake(on);
graphviz.onerror.and.callFake(onError);
graphviz.renderDot.and.callFake(renderDot);
