export const environment = {
  production: false,
  baseUrl: 'http://115.186.128.90:7070/api/v1/',
  // baseUrl: 'https://localhost:7276/api/v1/',
  paginationSize: 15,
  fileFormat: '.png, .jpg, .jpeg, .pdf, .xlsx, .docx, .doc, .csv, .mp4',
  dateTimePatterns: {
    date: 'YYYY-MM-DD',
    time: 'hh:mm A',
    dateTime: 'YYYY-MM-DD HH:mm',
  },
  defaultDate: new Date().toISOString()
};
