import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Invoice, type Settings } from './db';
import { formatCurrency } from './billing-utils';
import { format } from 'date-fns';

export async function generateInvoicePDF(invoice: Invoice, settings: Settings) {
    const doc = new jsPDF();

    // Header Colors & Styling
    const primaryColor = [79, 70, 229]; // Indigo-600
    const textColor = [15, 23, 42];
    const mutedColor = [100, 116, 139];

    // Shop Brand
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.shopName, 20, 25);

    // Invoice Title
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const title = invoice.type.toUpperCase();
    const titleWidth = doc.getTextWidth(title) + 10;
    doc.rect(210 - titleWidth - 20, 17, titleWidth, 10, 'F');
    doc.text(title, 210 - titleWidth - 15, 24);

    // Shop Details (Left)
    doc.setFontSize(9);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.setFont('helvetica', 'normal');
    const shopDetails = [
        settings.shopAddress,
        `Phone: ${settings.shopPhone}`,
        settings.shopGstin ? `GSTIN: ${settings.shopGstin}` : '',
    ].filter(Boolean);

    shopDetails.forEach((line, i) => {
        doc.text(line, 20, 32 + (i * 5));
    });

    // Invoice Details (Right)
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 140, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${format(new Date(invoice.date), 'dd/MM/yyyy')}`, 140, 45);

    // Customer Details
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 60, 170, 25, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 60, 170, 25, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('Bill To:', 25, 68);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(invoice.customer.name, 25, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ph: ${invoice.customer.phone}`, 25, 80);
    if (invoice.customer.gstin) doc.text(`GSTIN: ${invoice.customer.gstin}`, 90, 80);

    // Line Items Table
    const tableRows = invoice.items.map((item, index) => [
        index + 1,
        { content: `${item.name}\nHSN: ${item.hsnCode}`, styles: { fontStyle: 'bold' as const } },
        item.quantity,
        formatCurrency(item.price).replace('₹', ''),
        `${item.taxSlab}%`,
        formatCurrency(item.total).replace('₹', ''),
    ]);

    autoTable(doc, {
        startY: 95,
        head: [['#', 'Item Description', 'Qty', 'Rate', 'Tax', 'Amount']],
        body: tableRows,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor as [number, number, number],
            textColor: [255, 255, 255] as [number, number, number],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 'auto' },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'right', cellWidth: 30 },
            4: { halign: 'center', cellWidth: 20 },
            5: { halign: 'right', cellWidth: 35, fontStyle: 'bold' },
        },
        styles: { fontSize: 9, cellPadding: 4 },
    });

    // Summary (Below table)
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.text('Subtotal:', 140, finalY);
    doc.text('Total GST:', 140, finalY + 6);
    if (invoice.rounding !== 0) doc.text('Rounding:', 140, finalY + 12);

    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(invoice.subtotal), 190, finalY, { align: 'right' });
    doc.text(formatCurrency(invoice.totalTax), 190, finalY + 6, { align: 'right' });
    if (invoice.rounding !== 0) doc.text(invoice.rounding.toFixed(2), 190, finalY + 12, { align: 'right' });

    // Grand Total Box
    doc.setFillColor(...primaryColor);
    doc.rect(130, finalY + 18, 60, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('GRAND TOTAL', 135, finalY + 26);
    doc.setFontSize(14);
    doc.text(formatCurrency(invoice.totalAmount), 185, finalY + 26, { align: 'right' });

    // Signature Area
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text('For ' + settings.shopName, 140, finalY + 50);
    doc.line(140, finalY + 70, 190, finalY + 70);
    doc.text('Authorized Signatory', 150, finalY + 75);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated invoice.', 105, 285, { align: 'center' });

    // Output
    const fileName = `INV_${invoice.invoiceNumber}.pdf`;
    doc.save(fileName);
}
