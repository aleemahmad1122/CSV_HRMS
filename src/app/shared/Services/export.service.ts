import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportData(format: string, data: any[]): void {
    switch (format) {
      case 'print':
        this.printData();
        break;
      case 'copy':
        this.copyData(data);
        break;
      case 'excel':
        this.exportToExcel(data);
        break;
      default:
        break;
    }
  }

  private printData(): void {
    window.print();
  }

  private copyData(data: any[]): void {
    const textToCopy = data.map(client => `${client.name}, ${client.contactNumber}`).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Data copied to clipboard');
    });
  }

  private exportToExcel(data: any[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    XLSX.writeFile(workbook, 'clients.xlsx');
  }
}
