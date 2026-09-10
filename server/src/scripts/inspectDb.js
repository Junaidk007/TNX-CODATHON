import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const totalUsers = await db.collection('users').countDocuments();
  const admins = await db.collection('users').find({ role: 'admin' }, { projection: { email: 1, name: 1, role: 1 } }).toArray();
  const nonAdminUsers = await db.collection('users').countDocuments({ role: { $ne: 'admin' } });
  const totalTeams = await db.collection('teams').countDocuments();
  const ppts = await db.collection('teams').find({ ppt: { $exists: true, $ne: null, $nin: ['', null] } }, { projection: { teamName: 1, regnId: 1, ppt: 1 } }).toArray();
  const eventInfo = await db.collection('eventinfos').findOne({});

  console.log(JSON.stringify({
    totalUsers,
    admins,
    nonAdminUsers,
    totalTeams,
    pptsCount: ppts.length,
    ppts,
    eventInfo
  }, null, 2));

  await mongoose.disconnect();
}

inspect();
