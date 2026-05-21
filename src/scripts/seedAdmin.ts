import 'dotenv/config';
import { connectDB } from '../config/db';
import { UserModel } from '../models/user.schema';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const seed = async () => {
  await connectDB();
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@nova-health.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const existing = await UserModel.findOne({ email: adminEmail });
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 10);
    const now = new Date().toISOString();
    await UserModel.create({
      _id: randomUUID(),
      first_name: 'Admin',
      last_name: 'User',
      gender: 'Other',
      email: adminEmail,
      phone: '0000000000',
      role: 'admin',
      salary: 0,
      password_hash: hash,
      created_at: now,
      updated_at: now,
    });
    console.info('✅ Admin user created');
  } else {
    console.info('ℹ️ Admin user already exists');
  }
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
