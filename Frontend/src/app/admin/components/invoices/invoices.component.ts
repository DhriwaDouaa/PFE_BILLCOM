import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  customers: any[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('/api/invoices').subscribe({
      next: (data) => {
        this.invoices = data;
        this.filteredInvoices = data;
        this.loading = false;
      }
    });

    this.http.get<any[]>('/api/customers').subscribe({
      next: (data) => { this.customers = data; }
    });
  }

  getCustomerName(custId: number): string {
    const c = this.customers.find(c => c.custId === custId);
    return c ? c.name : 'Client #' + custId;
  }

  getCustomerCode(custId: number): string {
    const c = this.customers.find(c => c.custId === custId);
    return c ? c.codeClient : '-';
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    const status = this.selectedStatus;

    this.filteredInvoices = this.invoices.filter(i => {
      const matchName = this.getCustomerName(i.custId).toLowerCase().includes(term);
      const matchId = i.invoiceId?.toString().includes(term);
      const matchStatus = status ? i.status === status : true;
      return (matchName || matchId) && matchStatus;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.filteredInvoices = this.invoices;
  }

  getTotalAmount(): number {
    return this.filteredInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  }

  getPaidCount(): number {
    return this.invoices.filter(i => i.status === 'PAID').length;
  }

  getPendingCount(): number {
    return this.invoices.filter(i => i.status === 'PENDING').length;
  }

  // Export PDF une facture
  exportSinglePDF(invoice: any) {
    const doc = new jsPDF();
    const customerName = this.getCustomerName(invoice.custId);
    const customerCode = this.getCustomerCode(invoice.custId);

    // Header
    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('BSS as a Service', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('IoT Billing Platform — Oracle TimesTen', 14, 28);
    doc.text('FACTURE', 160, 18);
    doc.setFontSize(10);
    doc.text(`#${invoice.invoiceId}`, 160, 28);

    // Reset color
    doc.setTextColor(0, 0, 0);

    // Infos facture
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Client', 14, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nom : ${customerName}`, 14, 63);
    doc.text(`Code : ${customerCode}`, 14, 70);
    doc.text(`Client ID : #${invoice.custId}`, 14, 77);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Détails Facture', 120, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Facture N° : #${invoice.invoiceId}`, 120, 63);
    doc.text(`Période : ${new Date(invoice.periodStart).toLocaleDateString('fr-FR')} → ${new Date(invoice.periodEnd).toLocaleDateString('fr-FR')}`, 120, 70);
    doc.text(`Date création : ${new Date(invoice.createdDate || invoice.periodEnd).toLocaleDateString('fr-FR')}`, 120, 77);

    // Ligne séparatrice
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 85, 196, 85);

    // Tableau des montants
    autoTable(doc, {
      startY: 92,
      head: [['Description', 'Montant (DT)']],
      body: [
        ['Montant Brut', `${invoice.rawAmount?.toFixed(2)} DT`],
        ['Remise appliquée', `-${invoice.discountAmount?.toFixed(2)} DT`],
        ['Taxes', `+${invoice.taxAmount?.toFixed(2)} DT`],
      ],
      foot: [['TOTAL TTC', `${invoice.totalAmount?.toFixed(2)} DT`]],
      headStyles: { fillColor: [13, 110, 253], textColor: 255 },
      footStyles: { fillColor: [25, 135, 84], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 }
    });

    // Statut
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const statusColor = invoice.status === 'PAID' ? [25, 135, 84] : invoice.status === 'PENDING' ? [255, 193, 7] : [220, 53, 69];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(14, finalY, 50, 10, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Statut : ${invoice.status}`, 18, finalY + 7);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('BSS as a Service © 2026 — Généré automatiquement', 14, 280);
    doc.text('Oracle TimesTen — IoT Billing Platform', 14, 286);

    doc.save(`Facture_${invoice.invoiceId}_${customerName}.pdf`);
  }

  // Export PDF toutes les factures
  exportAllPDF() {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BSS as a Service — Rapport Factures', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')} — ${this.filteredInvoices.length} facture(s)`, 14, 27);

    // Tableau
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: 42,
      head: [['#', 'Client', 'Code', 'Période', 'Brut (DT)', 'Remise (DT)', 'Taxes (DT)', 'Total (DT)', 'Statut']],
      body: this.filteredInvoices.map(i => [
        `#${i.invoiceId}`,
        this.getCustomerName(i.custId),
        this.getCustomerCode(i.custId),
        `${new Date(i.periodStart).toLocaleDateString('fr-FR')} → ${new Date(i.periodEnd).toLocaleDateString('fr-FR')}`,
        `${i.rawAmount?.toFixed(2)}`,
        `-${i.discountAmount?.toFixed(2)}`,
        `+${i.taxAmount?.toFixed(2)}`,
        `${i.totalAmount?.toFixed(2)}`,
        i.status
      ]),
      headStyles: { fillColor: [13, 110, 253], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
      didDrawCell: (data: any) => {
        if (data.column.index === 8 && data.section === 'body') {
          const status = data.cell.text[0];
          if (status === 'PAID') data.cell.styles.textColor = [25, 135, 84];
          else if (status === 'PENDING') data.cell.styles.textColor = [255, 193, 7];
          else data.cell.styles.textColor = [220, 53, 69];
        }
      }
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Total général : ${this.getTotalAmount().toFixed(2)} DT`, 14, finalY);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('BSS as a Service © 2026 — Oracle TimesTen', 14, 286);

    doc.save(`Rapport_Factures_${new Date().toLocaleDateString('fr-FR')}.pdf`);
  }
}