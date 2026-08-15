import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportElementToPdf(
  elementId: string,
  filename: string,
  paperSize: 'a3' | 'a2' = 'a3'
) {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Export element with ID "${elementId}" not found.`);
    return;
  }

  // Create temporary container styling clone if needed
  const canvas = await html2canvas(element, {
    scale: 2, // High DPI resolution for crisp physical printing
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');

  // A3 Landscape: 420mm x 297mm | A2 Landscape: 594mm x 420mm
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: paperSize,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const margin = 10; // 10mm margin
  const imgWidth = pdfWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(
    imgData,
    'PNG',
    margin,
    margin,
    imgWidth,
    Math.min(imgHeight, pdfHeight - margin * 2)
  );

  pdf.save(`${filename}.pdf`);
}
