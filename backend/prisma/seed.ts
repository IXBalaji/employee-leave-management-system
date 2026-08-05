import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Passw0rd!', 10);

  const engineering = await prisma.department.create({ data: { name: 'Engineering' } });
  const design = await prisma.department.create({ data: { name: 'Design' } });
  const people = await prisma.department.create({ data: { name: 'People Ops' } });

  const [casual, sick, earned] = await Promise.all([
    prisma.leaveType.create({ data: { name: 'Casual Leave', isPaid: true, requiresApproval: true } }),
    prisma.leaveType.create({ data: { name: 'Sick Leave', isPaid: true, requiresApproval: true } }),
    prisma.leaveType.create({ data: { name: 'Earned Leave', isPaid: true, requiresApproval: true } }),
  ]);

  const standardPolicy = await prisma.leavePolicy.create({
    data: {
      name: 'Standard Policy',
      description: 'Default leave policy for all full-time employees.',
      rules: {
        create: [
          { leaveTypeId: casual.id, annualDays: 12, accrualFrequency: 'MONTHLY', maxCarryForward: 5 },
          { leaveTypeId: sick.id, annualDays: 10, accrualFrequency: 'ANNUAL', maxCarryForward: 0 },
          { leaveTypeId: earned.id, annualDays: 15, accrualFrequency: 'MONTHLY', maxCarryForward: 10 },
        ],
      },
    },
  });

  const admin = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-0001',
      firstName: 'Balaji',
      lastName: 'Masal',
      photoUrl: 'https://i.pravatar.cc/150?u=balaji.masal',
      dob: new Date('1988-05-14'),
      gender: 'MALE',
      bloodGroup: 'O+',
      maritalStatus: 'MARRIED',
      personalEmail: 'balaji.masal.personal@gmail.com',
      workEmail: 'balajim@incubxperts.com',
      phone: '+91 98765 43210',
      currentAddress: '204 Riverside Residency, Baner Road, Pune, Maharashtra 411045',
      permanentAddress: '12 Laxmi Nagar, Nashik, Maharashtra 422001',
      passwordHash,
      departmentId: people.id,
      designation: 'HR Administrator',
      employmentType: 'FULL_TIME',
      workLocation: 'Pune, India',
      dateOfJoining: new Date('2022-01-10'),
      govIdNumber: 'BALPM1234K',
      bankName: 'HDFC Bank',
      bankAccountNumber: '50100234567890',
      bankIfsc: 'HDFC0001234',
      emergencyContactName: 'Sunita Masal',
      emergencyContactRelationship: 'Spouse',
      emergencyContactPhone: '+91 98765 11111',
      role: 'ADMIN',
      status: 'ACTIVE',
      leavePolicyId: standardPolicy.id,
    },
  });

  const manager = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-0002',
      firstName: 'Nora',
      lastName: 'Fenwick',
      photoUrl: 'https://i.pravatar.cc/150?u=nora.fenwick',
      dob: new Date('1985-11-02'),
      gender: 'FEMALE',
      bloodGroup: 'A+',
      maritalStatus: 'SINGLE',
      personalEmail: 'nora.fenwick.personal@gmail.com',
      workEmail: 'nora.fenwick@example.com',
      phone: '+1 555 0142',
      currentAddress: '88 Harbor View Apartments, Seattle, WA 98101',
      permanentAddress: '88 Harbor View Apartments, Seattle, WA 98101',
      passwordHash,
      departmentId: engineering.id,
      designation: 'Engineering Manager',
      employmentType: 'FULL_TIME',
      workLocation: 'Seattle, WA',
      dateOfJoining: new Date('2021-06-01'),
      govIdNumber: 'SSN-514-22-9081',
      bankName: 'Chase Bank',
      bankAccountNumber: '00998877665544',
      bankIfsc: 'CHAS0004321',
      emergencyContactName: 'Ellen Fenwick',
      emergencyContactRelationship: 'Sister',
      emergencyContactPhone: '+1 555 0177',
      role: 'MANAGER',
      status: 'ACTIVE',
      leavePolicyId: standardPolicy.id,
    },
  });

  await prisma.department.update({ where: { id: engineering.id }, data: { headEmployeeId: manager.id } });

  const employee = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-0003',
      firstName: 'Devon',
      lastName: 'Marsh',
      photoUrl: 'https://i.pravatar.cc/150?u=devon.marsh',
      dob: new Date('1996-02-28'),
      gender: 'MALE',
      bloodGroup: 'B+',
      maritalStatus: 'SINGLE',
      personalEmail: 'devon.marsh.personal@gmail.com',
      workEmail: 'devon.marsh@example.com',
      phone: '+1 555 0100',
      currentAddress: '14 Elm Street, Apt 3B, Seattle, WA 98102',
      permanentAddress: '221 Maple Avenue, Portland, OR 97201',
      passwordHash,
      departmentId: engineering.id,
      designation: 'Frontend Engineer',
      employmentType: 'FULL_TIME',
      workLocation: 'Seattle, WA',
      dateOfJoining: new Date('2023-03-15'),
      govIdNumber: 'SSN-402-88-1147',
      bankName: 'Bank of America',
      bankAccountNumber: '38271940281',
      bankIfsc: 'BOFA0011223',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      reportingManagerId: manager.id,
      leavePolicyId: standardPolicy.id,
      emergencyContactName: 'Sam Marsh',
      emergencyContactRelationship: 'Sibling',
      emergencyContactPhone: '+1 555 0199',
    },
  });

  const year = new Date().getFullYear();
  await prisma.leaveBalance.createMany({
    data: [
      { employeeId: employee.id, leaveTypeId: casual.id, year, allocated: 12, used: 2 },
      { employeeId: employee.id, leaveTypeId: sick.id, year, allocated: 10, used: 0 },
      { employeeId: employee.id, leaveTypeId: earned.id, year, allocated: 15, used: 4 },
    ],
  });

  await prisma.holiday.createMany({
    data: [
      { name: "New Year's Day", date: new Date(`${year}-01-01`) },
      { name: 'Republic Day', date: new Date(`${year}-01-26`) },
      { name: 'Independence Day', date: new Date(`${year}-08-15`) },
      { name: 'Gandhi Jayanti', date: new Date(`${year}-10-02`) },
      { name: 'Christmas', date: new Date(`${year}-12-25`) },
    ],
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: employee.id,
      leaveTypeId: casual.id,
      startDate: new Date(`${year}-08-20`),
      endDate: new Date(`${year}-08-21`),
      reason: 'Family function',
      status: 'PENDING',
    },
  });

  console.log('Seed complete. Sign in with:');
  console.log(`  ${admin.workEmail} / Passw0rd!  (Admin)`);
  console.log(`  ${manager.workEmail} / Passw0rd!  (Manager)`);
  console.log(`  ${employee.workEmail} / Passw0rd!  (Employee)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
