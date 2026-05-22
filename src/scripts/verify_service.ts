/* eslint-disable */
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { AppointmentService } from '../services/appointment.service';
import { PatientModel } from '../models/patient.schema';
import { UserModel } from '../models/user.schema';
import { AppointmentModel } from '../models/appointment.schema';

async function run() {
  console.log('Connecting to database...');
  await mongoose.connect('mongodb://127.0.0.1:27017/nova-health');
  console.log('Connected.');

  // Find or create a patient
  let patient = await PatientModel.findOne().lean();
  if (patient) {
    if (!patient.is_active) {
      console.log(`Patient ${patient.first_name} is inactive. Activating...`);
      await PatientModel.updateOne({ _id: patient._id }, { $set: { is_active: true } });
      patient.is_active = true;
    }
  } else {
    console.log('No patient found in database. Creating a mock patient...');
    const patientId = randomUUID();
    const now = new Date().toISOString();
    const createdPatient = await PatientModel.create({
      _id: patientId,
      first_name: 'Test',
      last_name: 'Patient',
      dob: '1990-01-01',
      gender: 'male',
      blood_group: 'O+',
      phone: '1234567890',
      email: 'test.patient@example.com',
      address: {
        street: '123 Main St',
        city: 'Metropolis',
        state: 'NY',
        zip_code: '10001',
        country: 'USA'
      },
      is_active: true,
      created_by: 'admin-id',
      updated_by: 'admin-id',
      created_at: now,
      updated_at: now
    });
    patient = createdPatient.toObject();
  }

  // Find or create a doctor
  let doctor = await UserModel.findOne({ role: 'doctor' }).lean();
  if (doctor) {
    if (!doctor.is_active) {
      console.log(`Doctor ${doctor.first_name} is inactive. Activating...`);
      await UserModel.updateOne({ _id: doctor._id }, { $set: { is_active: true } });
      doctor.is_active = true;
    }
  } else {
    console.log('No doctor found in database. Creating a mock doctor...');
    const doctorId = randomUUID();
    const now = new Date().toISOString();
    const createdDoctor = await UserModel.create({
      _id: doctorId,
      first_name: 'Jane',
      last_name: 'Smith',
      gender: 'Female',
      email: 'jane.smith@nova-health.com',
      phone: '9876543210',
      role: 'doctor',
      salary: 120000,
      password_hash: 'hash_ChangeMe123!',
      is_active: true,
      created_at: now,
      updated_at: now
    });
    doctor = createdDoctor.toObject();
  }

  console.log(`Using Patient: ${patient.first_name} ${patient.last_name} (${patient._id})`);
  console.log(`Using Doctor: Dr. ${doctor.first_name} ${doctor.last_name} (${doctor._id})`);

  const service = new AppointmentService();

  // Clear existing appointments to start fresh for verification dates
  const testDate1 = '2026-10-15';
  const testDate2 = '2026-10-16';

  console.log('Cleaning up existing test appointments...');
  await AppointmentModel.deleteMany({
    scheduled_at: {
      $regex: `^(${testDate1}|${testDate2})`
    }
  });

  console.log('--- TEST 1: Daily token starting from 1 & Chronological ordering ---');
  // Create 3 appointments out of chronological order
  // Appt A: 10:00 AM
  // Appt B: 11:00 AM
  // Appt C: 09:00 AM

  console.log('Booking A (10:00 AM)...');
  const apptA = await service.bookAppointment({
    patient_id: patient._id,
    doctor_id: doctor._id,
    scheduled_at: `${testDate1}T10:00:00.000Z`,
    reason: 'Test Appointment A'
  }, 'admin@test.com');

  console.log('Booking B (11:00 AM)...');
  const apptB = await service.bookAppointment({
    patient_id: patient._id,
    doctor_id: doctor._id,
    scheduled_at: `${testDate1}T11:00:00.000Z`,
    reason: 'Test Appointment B'
  }, 'admin@test.com');

  console.log('Booking C (09:00 AM)...');
  const apptC = await service.bookAppointment({
    patient_id: patient._id,
    doctor_id: doctor._id,
    scheduled_at: `${testDate1}T09:00:00.000Z`,
    reason: 'Test Appointment C'
  }, 'admin@test.com');

  // Load from DB to check tokens
  const a = await service.getAppointmentById(apptA.id);
  const b = await service.getAppointmentById(apptB.id);
  const c = await service.getAppointmentById(apptC.id);

  console.log(`Appt C (09:00 AM) Token: ${c.token_number} (Expected: 1)`);
  console.log(`Appt A (10:00 AM) Token: ${a.token_number} (Expected: 2)`);
  console.log(`Appt B (11:00 AM) Token: ${b.token_number} (Expected: 3)`);

  if (c.token_number !== 1 || a.token_number !== 2 || b.token_number !== 3) {
    throw new Error('Test 1 Failed: Token numbers not correctly ordered chronologically');
  }
  console.log('Test 1 Passed!');

  console.log('--- TEST 2: Daily token reset for a different day ---');
  // Book an appointment for testDate2
  console.log('Booking D (10:00 AM next day)...');
  const apptD = await service.bookAppointment({
    patient_id: patient._id,
    doctor_id: doctor._id,
    scheduled_at: `${testDate2}T10:00:00.000Z`,
    reason: 'Test Appointment D'
  }, 'admin@test.com');

  console.log(`Appt D (Next Day 10:00 AM) Token: ${apptD.token_number} (Expected: 1)`);
  if (apptD.token_number !== 1) {
    throw new Error('Test 2 Failed: Token did not reset to 1 for the new day');
  }
  console.log('Test 2 Passed!');

  console.log('--- TEST 3: Rescheduling (same day re-ordering) ---');
  // Reschedule B (originally 11:00 AM, token 3) to 08:00 AM (should become token 1)
  console.log('Rescheduling B to 08:00 AM...');
  await service.updateAppointment(apptB.id, {
    scheduled_at: `${testDate1}T08:00:00.000Z`
  }, 'admin@test.com');

  const a_res = await service.getAppointmentById(apptA.id);
  const b_res = await service.getAppointmentById(apptB.id);
  const c_res = await service.getAppointmentById(apptC.id);

  console.log(`Rescheduled B (08:00 AM) Token: ${b_res.token_number} (Expected: 1)`);
  console.log(`Appt C (09:00 AM) Token: ${c_res.token_number} (Expected: 2)`);
  console.log(`Appt A (10:00 AM) Token: ${a_res.token_number} (Expected: 3)`);

  if (b_res.token_number !== 1 || c_res.token_number !== 2 || a_res.token_number !== 3) {
    throw new Error('Test 3 Failed: Same-day rescheduling did not re-sequence correctly');
  }
  console.log('Test 3 Passed!');

  console.log('--- TEST 4: Rescheduling (different day shift) ---');
  // Reschedule D (next day, token 1) to testDate1 at 09:30 AM (should slot in between C and A)
  console.log('Rescheduling D to testDate1 at 09:30 AM...');
  await service.updateAppointment(apptD.id, {
    scheduled_at: `${testDate1}T09:30:00.000Z`
  }, 'admin@test.com');

  const b_res4 = await service.getAppointmentById(apptB.id); // 08:00 -> should be 1
  const c_res4 = await service.getAppointmentById(apptC.id); // 09:00 -> should be 2
  const d_res4 = await service.getAppointmentById(apptD.id); // 09:30 -> should be 3
  const a_res4 = await service.getAppointmentById(apptA.id); // 10:00 -> should be 4

  console.log(`Appt B (08:00 AM) Token: ${b_res4.token_number} (Expected: 1)`);
  console.log(`Appt C (09:00 AM) Token: ${c_res4.token_number} (Expected: 2)`);
  console.log(`Appt D (09:30 AM) Token: ${d_res4.token_number} (Expected: 3)`);
  console.log(`Appt A (10:00 AM) Token: ${a_res4.token_number} (Expected: 4)`);

  if (b_res4.token_number !== 1 || c_res4.token_number !== 2 || d_res4.token_number !== 3 || a_res4.token_number !== 4) {
    throw new Error('Test 4 Failed: Different day rescheduling did not re-sequence both days correctly');
  }
  console.log('Test 4 Passed!');

  console.log('--- TEST 5: Cancellation token release ---');
  // Cancel C (09:00 AM, token 2)
  console.log('Cancelling C...');
  await service.updateAppointment(apptC.id, { status: 'cancelled' }, 'admin@test.com');

  const b_res5 = await service.getAppointmentById(apptB.id); // 08:00 -> should be 1
  const c_res5 = await service.getAppointmentById(apptC.id); // Cancelled -> should be 0
  const d_res5 = await service.getAppointmentById(apptD.id); // 09:30 -> should be 2
  const a_res5 = await service.getAppointmentById(apptA.id); // 10:00 -> should be 3

  console.log(`Appt B (08:00 AM) Token: ${b_res5.token_number} (Expected: 1)`);
  console.log(`Appt C (Cancelled) Token: ${c_res5.token_number} (Expected: 0)`);
  console.log(`Appt D (09:30 AM) Token: ${d_res5.token_number} (Expected: 2)`);
  console.log(`Appt A (10:00 AM) Token: ${a_res5.token_number} (Expected: 3)`);

  if (b_res5.token_number !== 1 || c_res5.token_number !== 0 || d_res5.token_number !== 2 || a_res5.token_number !== 3) {
    throw new Error('Test 5 Failed: Cancellation did not release token or shift subsequent tokens');
  }
  console.log('Test 5 Passed!');

  // Clean up test appointments
  console.log('Cleaning up test appointments...');
  await AppointmentModel.deleteMany({
    scheduled_at: {
      $regex: `^(${testDate1}|${testDate2})`
    }
  });

  console.log('All tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Test run failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
