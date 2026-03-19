import Papa from 'papaparse';
import { Transaction } from '../data/transactions';

export const fetchGoogleSheetData = async (url: string): Promise<Transaction[]> => {
  try {
    const response = await fetch(url);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const transactions: Transaction[] = results.data.map((row: any) => ({
            id: row.id || Math.random().toString(36).substr(2, 9),
            date: row.date || '',
            team: row.team || '',
            userName: row.userName || '',
            clientType: (row.clientType || 'NEW') as Transaction['clientType'],
            clientName: row.clientName || '',
            email: row.email || '',
            mobile: row.mobile || '',
            productName: row.productName || '',
            fromDate: row.fromDate || '',
            toDate: row.toDate || '',
            paymentMode: row.paymentMode || '',
            productPrice: parseFloat(String(row.productPrice).replace(/,/g, '')) || 0,
            gstAmount: parseFloat(String(row.gstAmount).replace(/,/g, '')) || 0,
            valueReceived: parseFloat(String(row.valueReceived).replace(/,/g, '')) || 0,
            paymentType: (row.paymentType || 'Full Payment') as Transaction['paymentType'],
            city: row.city || '',
            gender: row.gender || '',
            extraDays: parseInt(row.extraDays) || 0,
            remarks: row.remarks || '',
          }));
          resolve(transactions);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    return [];
  }
};
