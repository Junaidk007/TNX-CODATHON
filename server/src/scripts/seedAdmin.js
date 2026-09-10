import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

/**
 * Script to create or elevate an email to Admin role
 * Usage: node src/scripts/seedAdmin.js <email> [name]
 */
async function seedAdmin() {
  const email = (process.argv[2] || 'admin@techneekx.com').toLowerCase().trim();
  const name = process.argv[3] || 'TechNeekX Admin';

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB Atlas');

  try {
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          email,
          role: 'admin',
          isActivated: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('\n👑 ADMIN ACCOUNT READY:');
    console.log('-------------------------------------------');
    console.log(`Email : ${user.email}`);
    console.log(`Name  : ${user.name}`);
    console.log(`Role  : ${user.role.toUpperCase()}`);
    console.log(`ID    : ${user._id}`);
    console.log('-------------------------------------------');
    console.log('💡 How to log in as Admin:');
    console.log(`1. Go to the portal in your browser.`);
    console.log(`2. Click "My Team" (or "Sign In").`);
    console.log(`3. Enter '${user.email}'.`);
    console.log(`4. Enter the OTP code received from Clerk.`);
    console.log(`5. You will automatically land on the Admin Portal!\n`);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
