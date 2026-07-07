import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';

async function test() {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
    console.log('Using config:', {
      projectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId
    });

    const app = initializeApp(firebaseConfig);
    const db = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);

    const testRef = doc(db, 'settings', 'test_doc');
    console.log('Writing test doc...');
    await setDoc(testRef, { testValue: 'Hello from Node!', timestamp: Date.now() });
    console.log('Write successful!');

    console.log('Reading test doc...');
    const snap = await getDoc(testRef);
    if (snap.exists()) {
      console.log('Read successful! Data:', snap.data());
    } else {
      console.log('Doc does not exist!');
    }
  } catch (err) {
    console.error('CRITICAL DATABASE ERROR:', err);
  }
}

test();
