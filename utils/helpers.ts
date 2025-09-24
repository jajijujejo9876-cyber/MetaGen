
import { Metadata } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URI prefix: e.g., "data:image/png;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};


export const downloadCSV = (metadata: Metadata[]) => {
  const headers = ['File Name', 'Title', 'Keywords', 'Category'];
  
  const csvRows = [headers.join(',')];

  for (const item of metadata) {
    const fileName = `"${item.fileName.replace(/"/g, '""')}"`;
    const title = `"${item.title.replace(/"/g, '""')}"`;
    const keywords = `"${item.keywords.join(';').replace(/"/g, '""')}"`;
    const category = `"${item.category.replace(/"/g, '""')}"`;
    csvRows.push([fileName, title, keywords, category].join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'adobe_stock_metadata.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
