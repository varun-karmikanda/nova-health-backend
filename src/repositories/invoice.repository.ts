import { InvoiceModel } from '../models/invoice.schema';
import { Invoice } from '../models/invoice.dto';

export class InvoiceRepository {
  public async create(invoice: Invoice): Promise<Invoice> {
    const created = await InvoiceModel.create({
      _id: invoice.id,
      ...invoice,
    } as any);
    const { _id, ...rest } = created.toObject();
    return { id: _id, ...rest } as any;
  }

  public async findAll(): Promise<Invoice[]> {
    const invoices = await InvoiceModel.find({ is_deleted: false }).lean();
    return invoices.map((i) => {
      const { _id, ...rest } = i;
      return { id: _id, ...rest } as any;
    });
  }

  public async findById(id: string): Promise<Invoice | null> {
    const invoice = await InvoiceModel.findOne({ _id: id, is_deleted: false }).lean();
    if (!invoice) return null;
    const { _id, ...rest } = invoice;
    return { id: _id, ...rest } as any;
  }

  public async findByPatientId(patientId: string): Promise<Invoice[]> {
    const invoices = await InvoiceModel.find({ patient_id: patientId, is_deleted: false }).lean();
    return invoices.map((i) => {
      const { _id, ...rest } = i;
      return { id: _id, ...rest } as any;
    });
  }

  public async update(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<Invoice | null> {
    const updated = await InvoiceModel.findOneAndUpdate(
      { _id: id },
      { ...updates, updated_at: new Date().toISOString() },
      { new: true },
    ).lean();
    if (!updated) return null;
    const { _id, ...rest } = updated;
    return { id: _id, ...rest } as any;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await InvoiceModel.updateOne(
      { _id: id },
      { is_deleted: true, updated_at: new Date().toISOString() },
    );
    return result.modifiedCount > 0;
  }
}
