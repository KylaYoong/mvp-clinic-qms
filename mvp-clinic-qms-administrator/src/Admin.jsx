import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  setDoc,
  onSnapshot,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import "./Admin.css";
import SKPLogo from "./SKP-logo.jpg";

function Admin() {
  const [empID, setEmpID] = useState("");
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState(""); // New state for email
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const patientsRef = collection(db, "queue");
    const q = query(
      patientsRef,
      where("status", "in", ["waiting", "being attended"]),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(patientList);
    });

    return () => unsubscribe();
  }, []);

  const handleInviteNextPatient = async () => {
    try {
      if (patients.length === 0) {
        alert("No patients available in the queue!");
        return;
      }

      const currentPatient = patients.find(
        (patient) => patient.status === "being attended"
      );
      if (currentPatient) {
        await updateDoc(doc(db, "queue", currentPatient.id), {
          status: "completed",
        });
      }

      const nextPatient = patients.find((patient) => patient.status === "waiting");
      if (nextPatient) {
        await updateDoc(doc(db, "queue", nextPatient.id), {
          status: "being attended",
        });
        alert(`Invited: ${nextPatient.name}`);
      } else {
        alert("No more patients waiting!");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
  
    if (!empID.match(/^\d{6}$/)) {
      alert("Employee ID must be exactly 6 digits!");
      return;
    }
  
    if (!empName.match(/^[a-zA-Z ]+$/)) {
      alert("Employee name must contain only letters and spaces!");
      return;
    }
  
    setLoading(true);
    try {
      const queueCollection = collection(db, "queue");
      const queueSnapshot = await getDocs(queueCollection);
  
      // Safely map queue numbers
      const queueNumbers = queueSnapshot.docs
        .map((doc) => doc.data().queueNumber)
        .filter((queueNumber) => queueNumber !== undefined) // Filter out undefined values
        .map((queueNumber) =>
          parseInt(queueNumber.replace("D", ""), 10)
        );
  
      const nextQueueNumber = Math.max(0, ...queueNumbers) + 1;
      const queueNumber = `D${String(nextQueueNumber).padStart(4, "0")}`;
  
      // Save the patient document
      const patientRef = doc(queueCollection, empID);
      await setDoc(patientRef, {
        employeeID: empID,
        name: empName,
        email: empEmail || null, // Handle optional email properly
        queueNumber: queueNumber,
        status: "waiting",
        timestamp: Timestamp.now(),
      });
  
      alert(`Patient registered successfully! Queue number: ${queueNumber}`);
      setEmpID("");
      setEmpName("");
      setEmpEmail("");
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-container">
      <div className="header">
        <img src={SKPLogo} alt="SKP Logo" className="logo" />
        <h2 className="header-title">Admin Interface</h2>
      </div>

      <div className="admin-interface">
        <button onClick={handleInviteNextPatient}>Invite Next Patient</button>

        <form onSubmit={handleRegisterPatient} className="register-form">
          <input
            type="text"
            placeholder="Enter Employee ID"
            value={empID}
            onChange={(e) => setEmpID(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter Employee Name"
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Enter Employee Email"
            value={empEmail}
            onChange={(e) => setEmpEmail(e.target.value)} // Email field
          />
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register New Patient"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;
