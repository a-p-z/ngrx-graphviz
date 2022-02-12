import {HighlightPipe} from "./highlight.pipe";

describe('HighlightPipe', () => {
  let highlightPipe: HighlightPipe;

  beforeEach(() => {
    highlightPipe = new HighlightPipe();
  });

  describe('when filterText is empty', () => {
    let result: string;

    beforeEach(() => {
      result = highlightPipe.transform('value', '')
    });

    it('result should be equal to value', () => {
      expect(result).toEqual('value');
    });
  });

  describe('when filterText is not empty', () => {
    let result: string;

    beforeEach(() => {
      result = highlightPipe.transform('filterText value filterText', 'text')
    });

    it('Text should be wrapped into a span', () => {
      expect(result).toEqual('filter<span class="highlight">Text</span> value filter<span class="highlight">Text</span>');
    });
  });

  describe('when filterText contains special characters', () => {
    let result: string;

    beforeEach(() => {
      result = highlightPipe.transform('value filterText-[]{}()*+?./\^$|', 'text-[]{}()*+?./\^$|')
    });

    it('Text should be wrapped into a span', () => {
      expect(result).toEqual('value filter<span class="highlight">Text-[]{}()*+?./\^$|</span>');
    });
  });
});
