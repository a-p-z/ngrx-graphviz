import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "filter"})
export class FilterPipe implements PipeTransform {

  transform(items: any[], keysString: string, filterText: string): any[] {
    if (!filterText) {
      return items;
    }

    const keys = keysString.split(",").map((key) => key.trim());
    const pattern = filterText.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, "\\$&");
    const regex = new RegExp(pattern, "gi");

    return items.filter((item) =>
      keys.filter((key) => item.hasOwnProperty(key))
        .map((key) => item[key] as string)
        .map((value) => value.replace("<br/>", ' '))
        .some((value) => regex.test(value)));
  }
}
