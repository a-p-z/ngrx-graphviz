import * as actions from './actions';

describe('Actions', () => {
  let map: Map<string, number>;

  beforeEach(() => {
    map = new Map<string, number>();
    Object.keys(actions)
      .map((action) => (actions as any)[action]())
      .forEach(({type}) => map.set(type, (map.get(type) || 0) + 1));
  });

  Object.keys(actions).map((action) => (actions as any)[action]()).forEach(({type}) => {
    it(`'${type}' should be unique`, () => {
      expect(map.get(type)).toBe(1);
    });
  });
});
