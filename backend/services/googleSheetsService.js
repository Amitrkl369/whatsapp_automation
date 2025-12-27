import { google } from 'googleapis';
import config from '../config/config.js';

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
  }

  async initialize() {
    try {
      if (!config.googleSheets.clientEmail || !config.googleSheets.privateKey) {
        console.log('⚠️ Google Sheets credentials not configured');
        return false;
      }

      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: config.googleSheets.clientEmail,
          private_key: config.googleSheets.privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      console.log('✅ Google Sheets service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets:', error.message);
      return false;
    }
  }

  async getPendingMessages() {
    if (!this.sheets) {
      await this.initialize();
    }

    if (!this.sheets || !config.googleSheets.sheetId) {
      return [];
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheets.sheetId,
        range: 'Sheet1!A:F',
      });

      const rows = response.data.values || [];
      const pendingMessages = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const [teacher, student, phone, date, time, status] = row;

        if (status?.toLowerCase() === 'pending') {
          pendingMessages.push({
            rowIndex: i + 1,
            teacher,
            student,
            phone,
            date,
            time,
          });
        }
      }

      return pendingMessages;
    } catch (error) {
      console.error('❌ Error fetching pending messages:', error.message);
      return [];
    }
  }

  async updateMessageStatus(rowIndex, status) {
    if (!this.sheets || !config.googleSheets.sheetId) {
      return false;
    }

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: config.googleSheets.sheetId,
        range: `Sheet1!F${rowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[status]],
        },
      });

      return true;
    } catch (error) {
      console.error('❌ Error updating status:', error.message);
      return false;
    }
  }

  async getAllMeetings() {
    if (!this.sheets) {
      await this.initialize();
    }

    if (!this.sheets || !config.googleSheets.sheetId) {
      return [];
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheets.sheetId,
        range: 'Sheet1!A:F',
      });

      const rows = response.data.values || [];
      const meetings = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        meetings.push({
          teacher: row[0],
          student: row[1],
          phone: row[2],
          date: row[3],
          time: row[4],
          status: row[5],
        });
      }

      return meetings;
    } catch (error) {
      console.error('❌ Error fetching meetings:', error.message);
      return [];
    }
  }
}

export default new GoogleSheetsService();
