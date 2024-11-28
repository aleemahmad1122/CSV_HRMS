export const environment = {
    production: true,
    baseUrl: 'https://localhost:7276/api/v1/',
    paginationSize: 15,
    fileFormat: '.png, .jpg, .jpeg, .pdf, .xlsx, .docx, .doc, .csv, .mp4',
    timeFormat: "HH:mm:ss",
    dateFormat: "YYYY-MM-DD",
    defaultDate: new Date().toISOString().split("T")[0]
};
