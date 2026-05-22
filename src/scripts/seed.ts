/* eslint-disable */
import 'dotenv/config';
import { connectDB } from '../config/db';
import { UserModel } from '../models/user.schema';
import { PatientModel } from '../models/patient.schema';
import { AppointmentModel } from '../models/appointment.schema';
import { EncounterModel } from '../models/encounter.schema';
import { PrescriptionModel } from '../models/prescription.schema';
import { InvoiceModel } from '../models/invoice.schema';
import { AuditLogModel, AuditSnapshotModel } from '../models/audit.schema';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';

const rawUsers = [
  {
    _id: 'ce10c9bf-6a68-4c9d-befc-d429d9c95278',
    first_name: 'Admin',
    last_name: 'User',
    gender: 'Other',
    email: 'admin@nova-health.com',
    phone: '0000000000',
    role: 'admin',
    salary: 0,
    password_hash: 'hash_varun123!',
    created_at: '2026-05-21T01:59:02.670Z',
    updated_at: '2026-05-21T01:59:02.670Z',
    is_active: true,
  },
  {
    _id: '34c76796-4b71-4229-989f-84556c2f732d',
    first_name: 'Varun',
    last_name: 'K',
    gender: 'Male',
    email: 'varun@gmail.com',
    phone: '+91 9999999999',
    role: 'admin',
    salary: 1000000,
    password_hash: 'hash_varun@123',
    created_at: '2026-05-21T02:54:04.565Z',
    updated_at: '2026-05-21T14:49:57.497Z',
    is_active: false,
  },
  {
    _id: 'b2a3f092-8db6-4418-897f-9ee8473c6bcc',
    first_name: 'Varun',
    last_name: '95',
    gender: 'Male',
    email: 'varunbk95@gmail.com',
    phone: '12312313131',
    role: 'doctor',
    salary: 3000,
    password_hash: 'hash_Varun@123',
    is_active: false,
    created_at: '2026-05-21T14:44:45.353Z',
    updated_at: '2026-05-21T16:08:02.507Z',
  },
  {
    _id: '7f4602b6-1035-4052-a327-a49637ba1d80',
    first_name: 'Doctor',
    last_name: 'Main',
    gender: 'Male',
    email: 'doctor@gmail.com',
    phone: '1234567891',
    role: 'doctor',
    salary: 300000,
    password_hash: 'hash_doctor123',
    is_active: true,
    created_at: '2026-05-21T14:50:41.303Z',
    updated_at: '2026-05-21T14:50:41.303Z',
  },
  {
    _id: 'ab169fe1-4b62-4934-b398-e11305fa7237',
    first_name: 'receptionist',
    last_name: 'main',
    gender: 'Male',
    email: 'recep@gmail.com',
    phone: '1234512345',
    role: 'receptionist',
    salary: 50000,
    password_hash: 'hash_receptionist123',
    is_active: true,
    created_at: '2026-05-21T14:51:36.994Z',
    updated_at: '2026-05-21T14:51:36.994Z',
  },
  {
    _id: '1b6fe8c5-a4f3-42ad-90a3-73e9d9f74fde',
    first_name: 'tech',
    last_name: 'lab',
    gender: 'Male',
    email: 'tech@gmail.com',
    phone: '6789067890',
    role: 'lab_technician',
    salary: 90000,
    password_hash: 'hash_tech123',
    is_active: true,
    created_at: '2026-05-21T14:52:16.935Z',
    updated_at: '2026-05-21T14:52:16.935Z',
  },
];

const users = rawUsers.map((u) => {
  const plain = u.password_hash.startsWith('hash_')
    ? u.password_hash.substring(5)
    : u.password_hash;
  return {
    ...u,
    password_hash: bcrypt.hashSync(plain, 10),
  };
});

const migrateExistingAuditLogs = async () => {
  console.info('👥 Seeding/upserting core users for migration...');
  for (const u of users) {
    await UserModel.updateOne({ _id: u._id }, { $setOnInsert: u }, { upsert: true });
  }
  console.info('✅ Core users seeded/upserted.');

  console.info('🔄 Running migration: Populating user_name in existing audit logs...');
  const logsToMigrate = await AuditLogModel.find({ user_name: { $exists: false } });
  console.info(`Found ${logsToMigrate.length} audit logs without user_name.`);

  const promises = logsToMigrate.map(async (log) => {
    if (!log.user_id) return;

    if (log.user_id === 'system') {
      log.user_name = 'System';
      await log.save();
      return;
    }

    const user = await UserModel.findById(log.user_id).lean();
    if (user) {
      log.user_name = `${user.first_name} ${user.last_name}`;
      await log.save();
      return;
    } else {
      const userByEmail = await UserModel.findOne({ email: log.user_id }).lean();
      if (userByEmail) {
        log.user_name = `${userByEmail.first_name} ${userByEmail.last_name}`;
        await log.save();
      } else {
        log.user_name = log.user_id;
        await log.save();
      }
    }
  });

  await Promise.all(promises);
  console.info('✅ Migration completed.');
};

const seed = async () => {
  await connectDB();

  if (process.argv.includes('--migrate')) {
    await migrateExistingAuditLogs();
    process.exit(0);
  }

  console.info('🧹 Clearing existing collections...');
  
  await UserModel.deleteMany({});
  await PatientModel.deleteMany({});
  await AppointmentModel.deleteMany({});
  await EncounterModel.deleteMany({});
  await PrescriptionModel.deleteMany({});
  await InvoiceModel.deleteMany({});
  await AuditLogModel.deleteMany({});
  await AuditSnapshotModel.deleteMany({});

  console.info('👥 Seeding users...');

  await UserModel.create(users as any);
  console.info(`✅ Seeded ${users.length} users.`);

  console.info('🏥 Seeding patients with Indian names...');

  const patientIds = [
    'e94d8cb8-7264-4e94-8141-5dfd9744c803',
    'f08b3c66-880f-4886-9db6-f94d3a0889f5',
    'a5dcd3c1-7f91-4cf1-831e-1f7481de3f4a',
    'b4870f7f-e221-42ab-8c9e-5e3e29cf4711',
    'c29bf5b0-749e-4e4b-970f-44e26211756d',
  ];

  const patients = [
    {
      _id: patientIds[0],
      first_name: 'Aarav',
      last_name: 'Sharma',
      dob: '1990-05-15',
      gender: 'male',
      blood_group: 'A+',
      phone: '+91 9876543210',
      email: 'aarav.sharma@gmail.com',
      address: {
        street: '12, MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zip_code: '560001',
        country: 'India',
      },
      is_active: true,
      created_by: 'recep@gmail.com',
      updated_by: 'recep@gmail.com',
      created_at: '2026-05-21T15:00:00.000Z',
      updated_at: '2026-05-21T15:00:00.000Z',
    },
    {
      _id: patientIds[1],
      first_name: 'Aditi',
      last_name: 'Rao',
      dob: '1994-08-22',
      gender: 'female',
      blood_group: 'O+',
      phone: '+91 9123456789',
      email: 'aditi.rao@gmail.com',
      address: {
        street: '45, Park Street',
        city: 'Kolkata',
        state: 'West Bengal',
        zip_code: '700016',
        country: 'India',
      },
      is_active: true,
      created_by: 'recep@gmail.com',
      updated_by: 'recep@gmail.com',
      created_at: '2026-05-21T15:10:00.000Z',
      updated_at: '2026-05-21T15:10:00.000Z',
    },
    {
      _id: patientIds[2],
      first_name: 'Rahul',
      last_name: 'Patel',
      dob: '1988-12-05',
      gender: 'male',
      blood_group: 'B+',
      phone: '+91 9345678901',
      email: 'rahul.patel@gmail.com',
      address: {
        street: '88, Ring Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zip_code: '380015',
        country: 'India',
      },
      is_active: true,
      created_by: 'admin@nova-health.com',
      updated_by: 'admin@nova-health.com',
      created_at: '2026-05-21T15:20:00.000Z',
      updated_at: '2026-05-21T15:20:00.000Z',
    },
    {
      _id: patientIds[3],
      first_name: 'Sneha',
      last_name: 'Reddy',
      dob: '2001-03-14',
      gender: 'female',
      blood_group: 'AB+',
      phone: '+91 9456789012',
      email: 'sneha.reddy@gmail.com',
      address: {
        street: '24, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        zip_code: '500033',
        country: 'India',
      },
      is_active: true,
      created_by: 'recep@gmail.com',
      updated_by: 'recep@gmail.com',
      created_at: '2026-05-21T15:30:00.000Z',
      updated_at: '2026-05-21T15:30:00.000Z',
    },
    {
      _id: patientIds[4],
      first_name: 'Vikram',
      last_name: 'Singh',
      dob: '1975-07-19',
      gender: 'male',
      blood_group: 'O-',
      phone: '+91 9567890123',
      email: 'vikram.singh@gmail.com',
      address: {
        street: '102, Hawa Mahal Rd',
        city: 'Jaipur',
        state: 'Rajasthan',
        zip_code: '302002',
        country: 'India',
      },
      is_active: true,
      created_by: 'recep@gmail.com',
      updated_by: 'recep@gmail.com',
      created_at: '2026-05-21T15:40:00.000Z',
      updated_at: '2026-05-21T15:40:00.000Z',
    },
  ];

  await PatientModel.create(patients as any);
  console.info(`✅ Seeded ${patients.length} patients.`);

  console.info('📅 Seeding appointments...');

  const appointmentIds = [
    '5a5ff7c9-4de4-47bf-a1e6-b6b63d91cf95',
    '3d9cbb28-2fe4-4a25-83e8-5ea11a510c40',
    'fb5c03c5-f8be-40df-b118-82888cf36e2d',
    'b29c9b1b-689e-4ff6-8c4d-df791986420c',
    '23fd9db9-8b01-447a-8fbd-9c02ebbd4083',
    '4fd1fbfa-6bb4-4cf1-8c47-7977eb71ab85',
  ];

  const appointments = [
    {
      _id: appointmentIds[0],
      patient_id: patientIds[0], // Aarav
      doctor_id: '7f4602b6-1035-4052-a327-a49637ba1d80', // Doctor Main
      scheduled_at: '2026-05-21T09:00:00.000Z',
      token_number: 1,
      status: 'completed',
      reason: 'Regular checkup and chronic hypertension evaluation',
      created_by: 'recep@gmail.com',
      updated_by: 'recep@gmail.com',
      created_at: '2026-05-21T08:00:00.000Z',
      updated_at: '2026-05-21T09:30:00.000Z',
      is_deleted: false,
    },
    {
      _id: appointmentIds[1],
      patient_id: patientIds[1], // Aditi
      doctor_id: '7f4602b6-1035-4052-a327-a49637ba1d80', // Doctor Main
      scheduled_at: '2026-05-21T10:00:00.000Z',
      token_number: 2,
      status: 'completed',
      reason: 'Persistent migraine headaches',
      created_by: 'recep@gmail.com',
      updated_by: 'recep@gmail.com',
      created_at: '2026-05-21T08:15:00.000Z',
      updated_at: '2026-05-21T10:45:00.000Z',
      is_deleted: false,
    },
    {
      _id: appointmentIds[2],
      patient_id: patientIds[2], // Rahul
      doctor_id: 'b2a3f092-8db6-4418-897f-9ee8473c6bcc', // Varun 95
      scheduled_at: '2026-05-21T11:00:00.000Z',
      token_number: 1,
      status: 'completed',
      reason: 'Severe back pain and muscle spasm',
      created_by: 'admin@nova-health.com',
      updated_by: 'admin@nova-health.com',
      created_at: '2026-05-21T08:30:00.000Z',
      updated_at: '2026-05-21T11:30:00.000Z',
      is_deleted: false,
    },
    {
      _id: appointmentIds[3],
      patient_id: patientIds[3], // Sneha
      doctor_id: '7f4602b6-1035-4052-a327-a49637ba1d80', // Doctor Main
      scheduled_at: '2026-05-22T10:00:00.000Z',
      token_number: 1,
      status: 'confirmed',
      reason: 'Fever and sore throat',
      created_by: 'recep@gmail.com',
      updated_by: 'recep@gmail.com',
      created_at: '2026-05-21T15:30:00.000Z',
      updated_at: '2026-05-21T15:30:00.000Z',
      is_deleted: false,
    },
    {
      _id: appointmentIds[4],
      patient_id: patientIds[4], // Vikram
      doctor_id: 'b2a3f092-8db6-4418-897f-9ee8473c6bcc', // Varun 95
      scheduled_at: '2026-05-22T11:00:00.000Z',
      token_number: 1,
      status: 'pending',
      reason: 'Follow-up on post-operative knee recovery',
      created_by: 'recep@gmail.com',
      updated_by: 'recep@gmail.com',
      created_at: '2026-05-21T15:45:00.000Z',
      updated_at: '2026-05-21T15:45:00.000Z',
      is_deleted: false,
    },
    {
      _id: appointmentIds[5],
      patient_id: patientIds[0], // Aarav
      doctor_id: 'b2a3f092-8db6-4418-897f-9ee8473c6bcc', // Varun 95
      scheduled_at: '2026-05-23T09:30:00.000Z',
      token_number: 1,
      status: 'cancelled',
      reason: 'Patient requested rescheduling due to travel',
      created_by: 'recep@gmail.com',
      updated_by: 'recep@gmail.com',
      created_at: '2026-05-21T16:00:00.000Z',
      updated_at: '2026-05-22T06:00:00.000Z',
      is_deleted: true,
    },
  ];

  await AppointmentModel.create(appointments as any);
  console.info(`✅ Seeded ${appointments.length} appointments.`);

  console.info('🩺 Seeding encounters...');

  const encounterIds = [
    '6c6d03b0-ff8f-4cf1-8841-db78de71120a',
    '7b6f79e8-b801-447a-8fbd-9c02ebbd4083',
    '811b7dfb-2fe4-4a25-83e8-5ea11a510c40',
  ];

  const encounters = [
    {
      _id: encounterIds[0],
      appointment_id: appointmentIds[0],
      patient_id: patientIds[0],
      doctor_id: '7f4602b6-1035-4052-a327-a49637ba1d80',
      encounter_date: '2026-05-21T09:15:00.000Z',
      symptoms: 'Complaining of mild headache and occasional dizziness over past two weeks. Compliance with previous medications is adequate.',
      vitals: { bp_sys: 142, bp_dia: 88, hr: 76, temp_f: 98.4, wt_kg: 74 },
      diagnoses: ['Essential (primary) hypertension', 'Tension headache'],
      treatment_plan: 'Adjust anti-hypertensive dosage. Reduce caffeine intake and monitor daily BP. Return for review in two weeks.',
      notes: 'Patient is advised to maintain low-sodium diet and exercise regularly.',
      created_at: '2026-05-21T09:30:00.000Z',
      updated_at: '2026-05-21T09:30:00.000Z',
      is_deleted: false,
    },
    {
      _id: encounterIds[1],
      appointment_id: appointmentIds[1],
      patient_id: patientIds[1],
      doctor_id: '7f4602b6-1035-4052-a327-a49637ba1d80',
      encounter_date: '2026-05-21T10:20:00.000Z',
      symptoms: 'Throbbing unilateral headache, photophobia, and nausea for 3 days. Triggered by stress and lack of sleep.',
      vitals: { bp_sys: 120, bp_dia: 80, hr: 82, temp_f: 98.6, wt_kg: 58 },
      diagnoses: ['Migraine without aura', 'Stress-induced fatigue'],
      treatment_plan: 'Prescribe triptans for acute attacks. Rest in a quiet, dark room during onset.',
      notes: 'Patient kept a headache diary which suggests stress is the primary trigger.',
      created_at: '2026-05-21T10:45:00.000Z',
      updated_at: '2026-05-21T10:45:00.000Z',
      is_deleted: false,
    },
    {
      _id: encounterIds[2],
      appointment_id: appointmentIds[2],
      patient_id: patientIds[2],
      doctor_id: 'b2a3f092-8db6-4418-897f-9ee8473c6bcc',
      encounter_date: '2026-05-21T11:15:00.000Z',
      symptoms: 'Sharp lumbar back pain radiating to left thigh after lifting heavy boxes. Pain level 7/10.',
      vitals: { bp_sys: 130, bp_dia: 85, hr: 88, temp_f: 98.0, wt_kg: 82 },
      diagnoses: ['Acute lumbar muscle strain', 'Sciatica evaluation'],
      treatment_plan: 'Rest for 48 hours. Apply heat packs. Prescribe muscle relaxant and analgesic.',
      notes: 'Avoid heavy lifting and starting physical therapy stretching in 3 days.',
      created_at: '2026-05-21T11:30:00.000Z',
      updated_at: '2026-05-21T11:30:00.000Z',
      is_deleted: false,
    },
  ];

  await EncounterModel.create(encounters as any);
  console.info(`✅ Seeded ${encounters.length} encounters.`);

  console.info('💊 Seeding prescriptions...');

  const prescriptionIds = [
    'ad28cbb2-1ff4-4cf1-8841-db78de71120a',
    'cd6f79e8-b801-447a-8fbd-9c02ebbd4083',
    '311b7dfb-2fe4-4a25-83e8-5ea11a510c40',
  ];

  const prescriptions = [
    {
      _id: prescriptionIds[0],
      encounter_id: encounterIds[0],
      patient_id: patientIds[0],
      doctor_id: '7f4602b6-1035-4052-a327-a49637ba1d80',
      medication_items: [
        { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily in the morning', duration: '30 days' },
        { name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'As needed for headache (max 3x daily)', duration: '5 days' },
      ],
      instructions: 'Take Amlodipine after breakfast. Do not skip doses.',
      issued_at: '2026-05-21T09:30:00.000Z',
      status: 'signed',
      signed_at: '2026-05-21T09:30:00.000Z',
      refill_count: 2,
      created_at: '2026-05-21T09:30:00.000Z',
      updated_at: '2026-05-21T09:30:00.000Z',
      is_deleted: false,
    },
    {
      _id: prescriptionIds[1],
      encounter_id: encounterIds[1],
      patient_id: patientIds[1],
      doctor_id: '7f4602b6-1035-4052-a327-a49637ba1d80',
      medication_items: [
        { name: 'Sumatriptan 50mg', dosage: '1 tablet', frequency: 'At onset of migraine, repeat in 2 hours if needed (max 100mg/day)', duration: '10 tablets' },
        { name: 'Domperidone 10mg', dosage: '1 tablet', frequency: 'Twice daily before meals for nausea', duration: '5 days' },
      ],
      instructions: 'Take Sumatriptan as early as possible after headache begins.',
      issued_at: '2026-05-21T10:45:00.000Z',
      status: 'signed',
      signed_at: '2026-05-21T10:45:00.000Z',
      refill_count: 0,
      created_at: '2026-05-21T10:45:00.000Z',
      updated_at: '2026-05-21T10:45:00.000Z',
      is_deleted: false,
    },
    {
      _id: prescriptionIds[2],
      encounter_id: encounterIds[2],
      patient_id: patientIds[2],
      doctor_id: 'b2a3f092-8db6-4418-897f-9ee8473c6bcc',
      medication_items: [
        { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'Three times daily after food', duration: '7 days' },
        { name: 'Baclofen 10mg', dosage: '1 tablet', frequency: 'Once daily at bedtime', duration: '5 days' },
      ],
      instructions: 'Always take Ibuprofen with food to prevent gastric irritation. Baclofen may cause drowsiness.',
      issued_at: '2026-05-21T11:30:00.000Z',
      status: 'draft',
      signed_at: null,
      refill_count: 0,
      created_at: '2026-05-21T11:30:00.000Z',
      updated_at: '2026-05-21T11:30:00.000Z',
      is_deleted: false,
    },
  ];

  await PrescriptionModel.create(prescriptions as any);
  console.info(`✅ Seeded ${prescriptions.length} prescriptions.`);

  console.info('💵 Seeding invoices...');

  const invoiceIds = [
    'fd28cbb2-1ff4-4cf1-8841-db78de71120a',
    'ed6f79e8-b801-447a-8fbd-9c02ebbd4083',
    '411b7dfb-2fe4-4a25-83e8-5ea11a510c40',
    'd29c9b1b-689e-4ff6-8c4d-df791986420c',
    '33fd9db9-8b01-447a-8fbd-9c02ebbd4083',
    '5fd1fbfa-6bb4-4cf1-8c47-7977eb71ab85',
  ];

  const invoices = [
    {
      _id: invoiceIds[0],
      patient_id: patientIds[0],
      appointment_id: appointmentIds[0],
      total_amount: 1500,
      tax_amount: 150,
      paid_amount: 1650,
      status: 'paid',
      due_date: '2026-05-21T18:00:00.000Z',
      items: [
        { name: 'General Physician Consultation', price: 1000, quantity: 1 },
        { name: 'Electrocardiogram (ECG)', price: 500, quantity: 1 },
      ],
      created_at: '2026-05-21T09:30:00.000Z',
      updated_at: '2026-05-21T09:45:00.000Z',
      is_deleted: false,
    },
    {
      _id: invoiceIds[1],
      patient_id: patientIds[1],
      appointment_id: appointmentIds[1],
      total_amount: 1000,
      tax_amount: 100,
      paid_amount: 1100,
      status: 'paid',
      due_date: '2026-05-21T18:00:00.000Z',
      items: [
        { name: 'Specialist Consultation (Neurology)', price: 1000, quantity: 1 },
      ],
      created_at: '2026-05-21T10:45:00.000Z',
      updated_at: '2026-05-21T10:50:00.000Z',
      is_deleted: false,
    },
    {
      _id: invoiceIds[2],
      patient_id: patientIds[2],
      appointment_id: appointmentIds[2],
      total_amount: 1200,
      tax_amount: 120,
      paid_amount: 0,
      status: 'issued',
      due_date: '2026-06-04T18:00:00.000Z',
      items: [
        { name: 'Physiotherapy & Spine Consultation', price: 1200, quantity: 1 },
      ],
      created_at: '2026-05-21T11:30:00.000Z',
      updated_at: '2026-05-21T11:30:00.000Z',
      is_deleted: false,
    },
    {
      _id: invoiceIds[3],
      patient_id: patientIds[3],
      appointment_id: appointmentIds[3],
      total_amount: 800,
      tax_amount: 80,
      paid_amount: 0,
      status: 'draft',
      due_date: '2026-05-22T18:00:00.000Z',
      items: [
        { name: 'General Physician Consultation', price: 800, quantity: 1 },
      ],
      created_at: '2026-05-21T15:30:00.000Z',
      updated_at: '2026-05-21T15:30:00.000Z',
      is_deleted: false,
    },
    {
      _id: invoiceIds[4],
      patient_id: patientIds[4],
      appointment_id: appointmentIds[4],
      total_amount: 1200,
      tax_amount: 120,
      paid_amount: 0,
      status: 'draft',
      due_date: '2026-05-22T18:00:00.000Z',
      items: [
        { name: 'Orthopedic Consultation', price: 1200, quantity: 1 },
      ],
      created_at: '2026-05-21T15:45:00.000Z',
      updated_at: '2026-05-21T15:45:00.000Z',
      is_deleted: false,
    },
    {
      _id: invoiceIds[5],
      patient_id: patientIds[0],
      appointment_id: appointmentIds[5],
      total_amount: 0,
      tax_amount: 0,
      paid_amount: 0,
      status: 'cancelled',
      due_date: '2026-05-23T18:00:00.000Z',
      items: [
        { name: 'Cancelled Appointment Charge Waiver', price: 0, quantity: 1 },
      ],
      created_at: '2026-05-21T16:00:00.000Z',
      updated_at: '2026-05-22T06:00:00.000Z',
      is_deleted: true,
    },
  ];

  await InvoiceModel.create(invoices as any);
  console.info(`✅ Seeded ${invoices.length} invoices.`);

  console.info('🔒 Seeding audit logs with user names...');

  const auditLogs = [
    {
      _id: randomUUID(),
      entity_type: 'User',
      entity_id: 'ce10c9bf-6a68-4c9d-befc-d429d9c95278',
      action: 'LOGIN',
      user_id: 'ce10c9bf-6a68-4c9d-befc-d429d9c95278',
      user_name: 'Admin User',
      timestamp: '2026-05-21T08:00:00.000Z',
      source_ip: '192.168.1.5',
    },
    {
      _id: randomUUID(),
      entity_type: 'User',
      entity_id: '34c76796-4b71-4229-989f-84556c2f732d',
      action: 'LOGIN',
      user_id: '34c76796-4b71-4229-989f-84556c2f732d',
      user_name: 'Varun K',
      timestamp: '2026-05-21T08:05:00.000Z',
      source_ip: '192.168.1.12',
    },
    {
      _id: randomUUID(),
      entity_type: 'Patient',
      entity_id: patientIds[0],
      action: 'CREATE',
      user_id: 'ab169fe1-4b62-4934-b398-e11305fa7237',
      user_name: 'receptionist main',
      timestamp: '2026-05-21T15:00:00.000Z',
      source_ip: '192.168.1.15',
      changes: patients[0],
    },
    {
      _id: randomUUID(),
      entity_type: 'Patient',
      entity_id: patientIds[1],
      action: 'CREATE',
      user_id: 'ab169fe1-4b62-4934-b398-e11305fa7237',
      user_name: 'receptionist main',
      timestamp: '2026-05-21T15:10:00.000Z',
      source_ip: '192.168.1.15',
      changes: patients[1],
    },
    {
      _id: randomUUID(),
      entity_type: 'Appointment',
      entity_id: appointmentIds[0],
      action: 'CREATE',
      user_id: 'ab169fe1-4b62-4934-b398-e11305fa7237',
      user_name: 'receptionist main',
      timestamp: '2026-05-21T08:00:00.000Z',
      source_ip: '192.168.1.15',
      changes: appointments[0],
    },
    {
      _id: randomUUID(),
      entity_type: 'Appointment',
      entity_id: appointmentIds[1],
      action: 'CREATE',
      user_id: 'ab169fe1-4b62-4934-b398-e11305fa7237',
      user_name: 'receptionist main',
      timestamp: '2026-05-21T08:15:00.000Z',
      source_ip: '192.168.1.15',
      changes: appointments[1],
    },
    {
      _id: randomUUID(),
      entity_type: 'Encounter',
      entity_id: encounterIds[0],
      action: 'CREATE',
      user_id: '7f4602b6-1035-4052-a327-a49637ba1d80',
      user_name: 'Doctor Main',
      timestamp: '2026-05-21T09:30:00.000Z',
      source_ip: '192.168.1.20',
      changes: encounters[0],
    },
    {
      _id: randomUUID(),
      entity_type: 'Prescription',
      entity_id: prescriptionIds[0],
      action: 'CREATE',
      user_id: '7f4602b6-1035-4052-a327-a49637ba1d80',
      user_name: 'Doctor Main',
      timestamp: '2026-05-21T09:30:00.000Z',
      source_ip: '192.168.1.20',
      changes: prescriptions[0],
    },
    {
      _id: randomUUID(),
      entity_type: 'Invoice',
      entity_id: invoiceIds[0],
      action: 'CREATE',
      user_id: 'ab169fe1-4b62-4934-b398-e11305fa7237',
      user_name: 'receptionist main',
      timestamp: '2026-05-21T09:30:00.000Z',
      source_ip: '192.168.1.15',
      changes: invoices[0],
    },
    {
      _id: randomUUID(),
      entity_type: 'Patient',
      entity_id: patientIds[0],
      action: 'UPDATE',
      user_id: 'ce10c9bf-6a68-4c9d-befc-d429d9c95278',
      user_name: 'Admin User',
      timestamp: '2026-05-21T16:30:00.000Z',
      source_ip: '192.168.1.5',
      changes: { updated_by: 'admin@nova-health.com', email: 'aarav.sharma.updated@gmail.com' },
    },
  ];

  await AuditLogModel.create(auditLogs as any);
  console.info(`✅ Seeded ${auditLogs.length} audit logs.`);

  console.info('🎉 Database seeding completed successfully.');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
