const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'life-observatory' });
const db = admin.firestore();

async function run() {
  try {
    await db.collection('test').doc('ping').set({ ping: true, time: new Date().toISOString() });
    console.log('FIRESTORE_WRITE_SUCCESS');
    const doc = await db.collection('test').doc('ping').get();
    console.log('FIRESTORE_READ_SUCCESS:', doc.data());
    await db.collection('test').doc('ping').delete();
    console.log('FIRESTORE_CLEANUP_SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('FIRESTORE_ERROR:', err.message);
    process.exit(1);
  }
}

run();
