import {FilterPipe} from "./filter.pipe";

describe('FilterPipe', () => {
  let filterPipe: FilterPipe;

  beforeEach(() => {
    filterPipe = new FilterPipe();
  });

  describe('when filterText is empty', () => {
    let result: any[];

    beforeEach(() => {
      result = filterPipe.transform([{key: 'value'}], 'key', '');
    });

    it('items should not be filtered', () => {
      expect(result).toEqual([{key: 'value'}]);
    });
  });

  describe('when filterText is not empty', () => {
    let result: any[];

    beforeEach(() => {
      result = filterPipe.transform([
          {key1: 'value1<br/>filterText-[]{}()*+?./\^$|', key2: 'value2', key3: 'value3'},
          {key1: 'value1', key2: 'filterText<br/>value2', key3: 'value3'},
          {key1: 'value1', key2: 'value2', key3: 'filterText<br/>value3'}],
        'key1, key2',
        'text');
    });

    it('filtered items should contain filterText in at leas one key', () => {
      expect(result).toEqual([
        {key1: 'value1<br/>filterText-[]{}()*+?./\^$|', key2: 'value2', key3: 'value3'},
        {key1: 'value1', key2: 'filterText<br/>value2', key3: 'value3'}]);
    });
  });

  describe('when filterText contains special characters', () => {
    let result: any[];

    beforeEach(() => {
      result = filterPipe.transform([
          {key1: 'value1<br/>filterText-[]{}()*+?./\^$|', key2: 'value2', key3: 'value3'},
          {key1: 'value1', key2: 'filterText<br/>value2', key3: 'value3'},
          {key1: 'value1', key2: 'value2', key3: 'filterText<br/>value3'}],
        'key1, key2',
        'text-[]{}()*+?./\^$|');
    });

    it('filtered items should contain filterText with special characters in at leas one key', () => {
      expect(result).toEqual([{key1: 'value1<br/>filterText-[]{}()*+?./\^$|', key2: 'value2', key3: 'value3'}]);
    });
  });
});
