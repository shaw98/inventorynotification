import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Transfer } from './firebase/transferUtils';

// Type augmentation for jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Export transfers data to PDF with charts
 */
export const exportToPDF = (
  transfers: Transfer[], 
  title: string = 'Inventory Transfers Report',
  includeCharts: boolean = true
) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Prepare table data
  const tableColumn = ["Date", "Driver", "From", "To", "Stock #", "Brand/Model"];
  const tableRows = transfers.map(transfer => [
    transfer.transferDate,
    transfer.driverName,
    transfer.fromLocation,
    transfer.toLocation,
    transfer.stockNumber,
    `${transfer.brand} ${transfer.model}`
  ]);
  
  // Generate the table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [44, 62, 80],
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [242, 242, 242],
    },
  });
  
  // If charts should be included and we're in a browser environment
  if (includeCharts && typeof window !== 'undefined') {
    try {
      // Get the final Y position after the table
      const finalY = (doc as any).lastAutoTable.finalY || 35;
      
      // Add a page if there's not enough space for charts
      if (finalY > 180) {
        doc.addPage();
      }
      
      // Add charts section title
      doc.setFontSize(14);
      doc.text("Charts", 14, finalY > 180 ? 20 : finalY + 10);
      
      // Get chart canvases
      const chartCanvases = document.querySelectorAll('canvas');
      
      if (chartCanvases.length > 0) {
        let yPosition = finalY > 180 ? 30 : finalY + 20;
        
        // Add each chart to the PDF
        chartCanvases.forEach((canvas, index) => {
          // Check if we need a new page for this chart
          if (index > 0 && yPosition > 180) {
            doc.addPage();
            yPosition = 20;
          }
          
          try {
            // Convert canvas to image
            const imgData = canvas.toDataURL('image/png');
            
            // Add chart title
            const chartTitle = canvas.closest('div[class*="shadow-md"]')?.querySelector('h2')?.textContent || `Chart ${index + 1}`;
            doc.setFontSize(12);
            doc.text(chartTitle, 14, yPosition);
            
            // Add image to PDF
            doc.addImage(imgData, 'PNG', 14, yPosition + 5, 180, 80);
            
            // Update Y position for next chart
            yPosition += 95;
          } catch (err) {
            console.error(`Error adding chart ${index} to PDF:`, err);
          }
        });
      }
    } catch (err) {
      console.error("Error adding charts to PDF:", err);
    }
  }
  
  // Save the PDF
  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export transfers data to CSV/Excel
 */
export const exportToCSV = (transfers: Transfer[], title: string = 'Inventory Transfers') => {
  // Prepare the data
  const data = transfers.map(transfer => ({
    Date: transfer.transferDate,
    Driver: transfer.driverName,
    From: transfer.fromLocation,
    To: transfer.toLocation,
    'Stock #': transfer.stockNumber,
    'Brand/Model': `${transfer.brand} ${transfer.model}`,
  }));
  
  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transfers');
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create a Blob from the buffer
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save the file
  saveAs(blob, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
}; 