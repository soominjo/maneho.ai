import admin from 'firebase-admin';

async function test() {
  try {
    console.log('Testing Firestore access...\n');

    // Initialize with just project ID - uses Application Default Credentials
    const app = admin.initializeApp({ projectId: 'maneho-ai' });
    const db = app.firestore();

    console.log('✅ Firebase Admin SDK initialized');

    // Test write
    const docRef = db.collection('documents').doc('test-doc-' + Date.now());
    await docRef.set({
      test: 'value',
      timestamp: new Date(),
      message: 'This is a test document'
    });

    console.log('✅ Firestore write successful!');
    console.log(`   Document ID: ${docRef.id}`);

    // Test read
    const doc = await docRef.get();
    console.log('✅ Firestore read successful!');
    console.log(`   Data: ${JSON.stringify(doc.data())}`);

    // Clean up
    await docRef.delete();
    console.log('✅ Firestore delete successful!');

    console.log('\n🎉 All Firestore operations work!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Firestore test failed:');
    console.error(error);
    console.error('\nPossible causes:');
    console.error('1. gcloud auth application-default login not run');
    console.error('2. Missing Firestore API in GCP');
    console.error('3. Permission denied (check IAM roles)');
    process.exit(1);
  }
}

test();
