export const environment = {
    production: true,
    baseUrl: 'https://localhost:7276/api/v1/',
    paginationSize: 15,
    fileFormat: '.png, .jpg, .jpeg, .pdf, .xlsx, .docx, .doc, .csv, .mp4',
    dateTimePatterns: {
        date: 'YYYY-MM-DD',
        time: 'HH:mm:ss',
        dateTime: 'YYYY-MM-DD HH:mm:ss',
    },
    defaultDate: new Date().toISOString()
};
