import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SortingService {
  sort<T extends Record<string, string | number | Date>>(array: T[], field: keyof T, ascending: boolean): T[] {
    return array.sort((a, b) => {
      let comparison: number;

      if (typeof a[field] === 'string' && typeof b[field] === 'string') {
        comparison = a[field].localeCompare(b[field]);
      } else if (typeof a[field] === 'string' && typeof b[field] === 'string' && a[field].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/) &&
        b[field].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)) {
        comparison = a[field].localeCompare(b[field]); // Compare ISO date strings
      } else if (a[field] instanceof Date && b[field] instanceof Date) {
        comparison = (a[field] as Date).getTime() - (b[field] as Date).getTime(); // Compare dates
      } else {
        comparison = (a[field] as number) - (b[field] as number); // Assuming numeric comparison
      }

      return ascending ? comparison : -comparison; // Ascending or descending
    });
  }
}
