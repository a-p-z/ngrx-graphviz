import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'highlight'})
export class HighlightPipe implements PipeTransform {

  transform(value: string, filterText: string): string {
    if (!filterText) {
      return value;
    }

    const pattern = HighlightPipe.pattern(filterText);
    const regex = new RegExp(pattern, 'gi');

    return value.replace(regex, (match: string) => `<span class="highlight">${match}</span>`);
  }

  private static pattern(filterText: string): string {
    const subPattern = filterText.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, '\\$&')
      .split(' ')
      .filter((t: string) => t.length > 0)
      .join('|');
    return `(${subPattern})(?![^<]*>)`;
  }
}
