import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertTime',
  standalone: true,
})
export class ConvertTimePipe implements PipeTransform {
  transform(date: string | Date, formatKey: string): string | null {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.error('Invalid date or time format:', date);
        return null;
      }

      // Map custom format patterns to Angular's date pipe syntax
      const formatMappings: Record<string, string> = {
        date: 'MMM-d-y',
        time: 'h:mm a',
        dateTime: 'MMM-d-y h:mm a',
      };

      // Fetch the format from the mappings
      const format = formatMappings[formatKey];
      if (!format) {
        console.error(`Format key "${formatKey}" not found in format mappings.`);
        return null;
      }

      return formatDate(parsedDate, format, 'en-US');
    } catch (error) {
      console.error('Error formatting date or time:', error);
      return null;
    }
  }
}
