import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calculateTime',
  standalone: true
})
export class CalculateTimePipe implements PipeTransform {

  transform(startTime: string, endTime: string): string {

    if (!startTime || !endTime) {
      return 'N/A';
    }

    const start = new Date(startTime);
    const end = new Date(endTime);


    const diffMs = end.getTime() - start.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));


    if (hours > 0 && minutes > 0) {
      return `${hours} hours ${minutes} mins`;
    } else if (hours > 0) {
      return `${hours} hours`;
    } else if (minutes > 0) {
      return `${minutes} mins`;
    } else {
      return '0 mins';
    }
  }

}
