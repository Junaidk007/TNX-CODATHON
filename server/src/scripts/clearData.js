import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function clearData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB Atlas');

  const db = mongoose.connection.db;

  try {
    // 1. Delete PPT assets from Cloudinary (both image and raw resource types)
    console.log('\n🧹 Clearing Cloudinary PPT files...');
    try {
      const resImg = await cloudinary.api.delete_resources_by_prefix('codathon_ppts', {
        resource_type: 'image',
      });
      console.log('  Cloudinary (image) deleted:', resImg?.deleted || 'none');
    } catch (cErr) {
      console.warn('  Cloudinary image prefix delete note:', cErr.message || cErr);
    }

    try {
      const resRaw = await cloudinary.api.delete_resources_by_prefix('codathon_ppts', {
        resource_type: 'raw',
      });
      console.log('  Cloudinary (raw) deleted:', resRaw?.deleted || 'none');
    } catch (cErr) {
      console.warn('  Cloudinary raw prefix delete note:', cErr.message || cErr);
    }

    // 2. Delete all teams from MongoDB
    console.log('\n🗑️ Deleting teams from MongoDB...');
    const teamsDeleteResult = await db.collection('teams').deleteMany({});
    console.log(`  Deleted ${teamsDeleteResult.deletedCount} teams.`);

    // 3. Delete all non-admin users from MongoDB
    console.log('\n🗑️ Deleting non-admin users from MongoDB...');
    const usersDeleteResult = await db.collection('users').deleteMany({
      role: { $ne: 'admin' },
    });
    console.log(`  Deleted ${usersDeleteResult.deletedCount} non-admin users.`);

    // 4. Reset teamId on all remaining admin users
    console.log('\n🛡️ Resetting team assignments for Admin accounts...');
    const adminUpdateResult = await db.collection('users').updateMany(
      { role: 'admin' },
      { $set: { teamId: null } }
    );
    console.log(`  Updated ${adminUpdateResult.modifiedCount} admin user records.`);

    // 5. Audit remaining data
    const remainingAdmins = await db.collection('users').find({ role: 'admin' }).toArray();
    const remainingUsers = await db.collection('users').countDocuments();
    const remainingTeams = await db.collection('teams').countDocuments();
    const eventInfoCount = await db.collection('eventinfos').countDocuments();

    console.log('\n===========================================');
    console.log('📊 DATABASE PURGE COMPLETE:');
    console.log('-------------------------------------------');
    console.log(`Remaining Teams      : ${remainingTeams}`);
    console.log(`Remaining Total Users: ${remainingUsers}`);
    console.log(`Remaining Admins     : ${remainingAdmins.length}`);
    remainingAdmins.forEach((a) => {
      console.log(`  • ${a.name} (${a.email}) [Role: ${a.role.toUpperCase()}]`);
    });
    console.log(`Event Info Preserved : ${eventInfoCount} record`);
    console.log('===========================================\n');
  } catch (err) {
    console.error('❌ Error during data purge:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

clearData();
