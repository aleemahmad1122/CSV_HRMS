import { Pipe, PipeTransform } from '@angular/core';
declare var $: any;

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  public transform(items: any, query: string, dataSet?: any, setfilterColumms?: any[]): any {
    try {
      if (query == "" || query == null || query == undefined) {
        return items;
      }
      //console.log(items, query, dataSet);
      var filteredColumns: any = [];
      //get filtered columns
      if (setfilterColumms != null && setfilterColumms != undefined) {
        filteredColumns = setfilterColumms;
      } else {
        // filteredColumns = UtilityService.filteredColumns;
      }
      //check if filtered columns were provided or not
      var filteredColumnsGiven = (filteredColumns != null && filteredColumns != undefined && filteredColumns.length > 0) ? true : false;
  
      //filtered array to store new values after applying filter
      var filtered: any = [];
  
      var exists = false;
      var theItem: any; var i = 0; var value; var is_date;
      var elementsCount = items.length;
      var bClientFilterGiven = false;
  
      //NEW REQUIREMENT (01/13/2018):
      if (dataSet != null && dataSet != undefined && dataSet.length > 0) {
        items = dataSet;
        elementsCount = 30;
        bClientFilterGiven = true;
      }
  
      var counter = 0;
      for (i = 0; i < items.length; i++) {
  
        //current item
        theItem = items[i];
  
        //child loop to iterate through each object's dynamic properties
        Object.keys(theItem).forEach(function (key) {
  
          key = key.toString();
          var goAhead = true;
  
          //cc
          if (filteredColumnsGiven) {
            //check if this 'key' is present in filtered columns or not..
            if ($.inArray(key, filteredColumns) < 0) {
              //this key was NOT in the list, DO NOT FILTER
              goAhead = false;
            }
          }
  
          //go ahead with filter
          if (goAhead) {
            value = theItem[key];
            if (value != "" && value != null && value != undefined) {
  
              if (typeof (value) === "string") {
                //String
                exists = value.toString().toLowerCase().indexOf(query.toString().toLowerCase()) !== -1;
              }
              else {
                //Number 
                exists = value.toString().indexOf(query.toString()) !== -1;
              }
              if (exists) {
                //If filtered array doesn't contain this item, push item into array
                if (filtered != null && filtered != undefined) {
                  if (items[i] != null && items[i] != undefined) {
  
                    if (filtered.indexOf(items[i]) === -1) {
                      if (!bClientFilterGiven) {
                        filtered.push(items[i]);
                      }
                      else {
                        if (counter <= elementsCount) {
                          filtered.push(items[i]);
                          counter++;
                        }
                      }
                    }
                    else {
                      //console.log("This item already exists");
                    }
                  }
                }
              }
            }
          }
        });
      }
      return filtered;
    }
    catch (e) {
      console.error(e);
    }
  }

}
