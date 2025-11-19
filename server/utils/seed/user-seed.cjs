const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('node:path');

// 👇 adjust path to your service account JSON
const serviceAccount = require(path.join(
  __dirname,
  '../minty-budget-app-firebase-adminsdk-fbsvc-0fa2dba133.json'
));

const { v4 } = require('uuid');

// 1. Init admin
initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

async function seed() {
  console.log("🌱 Starting Firestore seed...")
  
  var id = v4()
  await db.collection("users").doc(id).set({
    uid: id,
    firstName: "Anthony",
    lastName: "Prabowo",
    email: "anthonyprabowo@gmail.com",
    real_balance: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  id = v4()
  await db.collection("users").doc(id).set({
    uid: id,
    firstName: "Sharon",
    lastName: "Soetadi",
    email: "soetadi.hellosharon@gmail.com",
    real_balance: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  })


  const batch = db.batch()

  await batch.commit()

  console.log("✨ Firestore seed completed.")
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
