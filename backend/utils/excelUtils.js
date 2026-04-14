const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE_PATH = path.join(__dirname, '../attendance.xlsx');

/**
 * Appends a new attendance record to the local Excel file.
 * If the file doesn't exist, it creates one with headers.
 */
const appendToExcel = (data) => {
  try {
    let workbook;
    let worksheet;
    const sheetName = 'Attendance';

    // Prepare the data row
    const newRow = {
      'Date': data.date,
      'Time': new Date(data.timestamp).toLocaleTimeString(),
      'Vendor': data.vendor,
      'Vehicle Number': data.vehicleNumber,
      'Driver Name': data.driverName,
      'Mobile Number': data.mobileNumber,
      'Entry Pass': data.entryPass,
      'DCD Status': data.dcdStatus,
      'Vehicle Type': data.vehicleType,
      'Latitude': data.location.lat,
      'Longitude': data.location.lng,
      'Distance (m)': data.distanceFromOffice
    };

    if (fs.existsSync(EXCEL_FILE_PATH)) {
      // Load existing workbook
      workbook = XLSX.readFile(EXCEL_FILE_PATH);
      worksheet = workbook.Sheets[sheetName];
      
      // Append the new row
      XLSX.utils.sheet_add_json(worksheet, [newRow], { origin: -1, skipHeader: true });
    } else {
      // Create new workbook and worksheet
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.json_to_sheet([newRow]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // Write the file
    XLSX.writeFile(workbook, EXCEL_FILE_PATH);
    console.log(`✅ Record appended to Excel: ${EXCEL_FILE_PATH}`);
  } catch (error) {
    console.error('❌ Error writing to Excel:', error.message);
  }
};

module.exports = { appendToExcel };
