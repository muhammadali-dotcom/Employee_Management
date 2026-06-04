// ─────────────────────────────────────────────────────────────────────────────
// scripts/createSuperAdmin.ts  —  ONE-TIME SETUP SCRIPT
//
// Run this ONCE to create the first super admin account:
//
//   cd BackEnd
//   npx ts-node src/scripts/createSuperAdmin.ts
//
// You can re-run it safely — it will UPDATE the password if the email exists.
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database';
import Employee  from '../models/Employee';
import bcrypt    from 'bcrypt';

// ── Change these before running ───────────────────────────────────────────────
const SUPER_ADMIN_EMAIL     = 'admin@company.com';
const SUPER_ADMIN_PASSWORD  = 'Admin@1234';        // change this!
const SUPER_ADMIN_FIRSTNAME = 'Super';
const SUPER_ADMIN_LASTNAME  = 'Admin';
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

  const existing = await Employee.findOne({ where: { email: SUPER_ADMIN_EMAIL } });

  if (existing) {
    await existing.update({ passwordHash, role: 'super_admin' });
    console.log(`✅ Updated existing employee "${SUPER_ADMIN_EMAIL}" → role=super_admin, password reset`);
  } else {
    await Employee.create({
      firstName:    SUPER_ADMIN_FIRSTNAME,
      lastName:     SUPER_ADMIN_LASTNAME,
      email:        SUPER_ADMIN_EMAIL,
      phone:        null,
      role:         'super_admin',
      departmentId: null,
      status:       'active',
      joinDate:     new Date().toISOString().split('T')[0],
      passwordHash,
    });
    console.log(`✅ Created super admin: ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PASSWORD}`);
  }

  console.log('');
  console.log('You can now log in at http://localhost:3000/login');
  console.log(`  Email:    ${SUPER_ADMIN_EMAIL}`);
  console.log(`  Password: ${SUPER_ADMIN_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
