import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {

  transform(text: any, search: any): any {
    try {
      if (search == undefined || text == undefined) {
        return text;
      }
      text = text.toString();
      search = search.toString();
  
      var pattern = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      pattern = pattern.split(' ').filter((t: any) => {
        return t.length > 0;
      }).join('|');
  
      var regex = new RegExp(pattern, 'gi');
      return search ? text.replace(regex, (match: any) => `<span class="highlight">${match}</span>`) : text;
    }
    catch (e) {
      console.error(e);
    }
  }

}
