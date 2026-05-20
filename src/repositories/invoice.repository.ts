import { Invoice } from '../models/invoice.dto';

export class InvoiceRepository {
  private static invoices: Invoice[] = [];

  public create(invoice: Invoice): Promise<Invoice> {
    InvoiceRepository.invoices.push(invoice);
    return Promise.resolve(invoice);
  }

  public findAll(): Promise<Invoice[]> {
    return Promise.resolve(InvoiceRepository.invoices.filter((i) => !i.is_deleted));
  }

  public findById(id: string): Promise<Invoice | null> {
    const invoice = InvoiceRepository.invoices.find((i) => i.id === id && !i.is_deleted);
    return Promise.resolve(invoice ?? null);
  }

  public findByPatientId(patientId: string): Promise<Invoice[]> {
    return Promise.resolve(
      InvoiceRepository.invoices.filter((i) => i.patient_id === patientId && !i.is_deleted),
    );
  }

  public update(id: string, updates: Record<string, unknown>): Promise<Invoice | null> {
    const index = InvoiceRepository.invoices.findIndex((i) => i.id === id);
    if (index === -1) return Promise.resolve(null);

    const current = InvoiceRepository.invoices[index];
    if (!current) return Promise.resolve(null);

    Object.assign(current, updates, { updated_at: new Date().toISOString() });
    return Promise.resolve(current);
  }

  public softDelete(id: string): Promise<boolean> {
    const index = InvoiceRepository.invoices.findIndex((i) => i.id === id);
    if (index === -1) return Promise.resolve(false);

    const current = InvoiceRepository.invoices[index];
    if (!current) return Promise.resolve(false);

    Object.assign(current, {
      is_deleted: true,
      updated_at: new Date().toISOString(),
    });
    return Promise.resolve(true);
  }
}
