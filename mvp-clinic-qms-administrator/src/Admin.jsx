// Import necessary React and Firebase dependencies
import React, { useEffect, useState } from "react";
import { db } from "./firebase"; // Import the Firestore database instance
import {
  collection,      // Access Firestore collections
  query,           // Create queries to filter documents
  where,           // Add conditions to the query
  orderBy,         // Order documents in the query results
  updateDoc,       // Update specific documents
  doc,             // Reference specific documents
  setDoc,          // Create or overwrite documents
  onSnapshot,      // Real-time listener for Firestore documents
  Timestamp,       // Generate Firestore timestamps
} from "firebase/firestore";
import "./Admin.css"; // Import the CSS for admin styling
import SKPLogo from "./SKP-logo.jpg"; // Import the SKP logo

// Define the Admin component
function Admin() {
  // State to manage form inputs and the queue
  const [empID, setEmpID] = useState(""); // Holds Employee ID input
  const [empName, setEmpName] = useState(""); // Holds Employee Name input
  const [loading, setLoading] = useState(false); // Tracks whether the form is submitting
  const [patients, setPatients] = useState([]); // Holds the list of patients in the queue

  // useEffect to set up a real-time listener for Firestore data
  useEffect(() => {
    // Reference to the "queue" collection
    const patientsRef = collection(db, "queue");

    // Create a query to fetch patients with "waiting" or "being attended" status, ordered by timestamp
    const q = query(
      patientsRef,
      where("status", "in", ["waiting", "being attended"]),
      orderBy("timestamp", "asc")
    );

    // Set up a real-time listener for Firestore updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientList = snapshot.docs.map((doc) => ({
        id: doc.id,        // Get the document ID
        ...doc.data(),     // Merge the document's data fields
      }));
      setPatients(patientList); // Update the `patients` state with the fetched data
    });

    // Cleanup function to remove the Firestore listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Function to handle inviting the next patient
  const handleInviteNextPatient = async () => {
    try {
      // If no patients are in the queue, show an alert
      if (patients.length === 0) {
        alert("No patients available in the queue!");
        return;
      }

      // Find the patient currently being attended
      const currentPatient = patients.find(
        (patient) => patient.status === "being attended"
      );
      if (currentPatient) {
        console.log("Completing current patient:", currentPatient.id); // Log the action for debugging
        // Mark the current patient's status as "completed"
        await updateDoc(doc(db, "queue", currentPatient.id), {
          status: "completed",
        });
      }

      // Find the next patient in the queue
      const nextPatient = patients.find(
        (patient) => patient.status === "waiting"
      );
      if (nextPatient) {
        // Update the next patient's status to "being attended"
        await updateDoc(doc(db, "queue", nextPatient.id), {
          status: "being attended",
        });
        alert(`Invited: ${nextPatient.name}`);
      } else {
        alert("No more patients waiting!");
      }
    } catch (error) {
      alert(`Error: ${error.message}`); // Show an alert for errors
    }
  };

  // Function to handle registering a new patient
  const handleRegisterPatient = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    // Validate Employee ID (must be exactly 6 digits)
    if (!empID.match(/^\d{6}$/)) {
      alert("Employee ID must be exactly 6 digits!");
      return;
    }

    // Validate Employee Name (must only contain letters and spaces)
    if (!empName.match(/^[a-zA-Z ]+$/)) {
      alert("Employee name must contain only letters and spaces!");
      return;
    }

    setLoading(true); // Set the loading state to true during submission
    try {
      // Create a document reference in the "queue" collection with empID as the document ID
      const patientRef = doc(collection(db, "queue"), empID);
      // Save the patient data to Firestore
      await setDoc(patientRef, {
        employeeID: empID,
        name: empName,
        status: "waiting",        // New patients start with "waiting" status
        timestamp: Timestamp.now(), // Record the current time
      });

      alert("Patient registered successfully!");
      setEmpID(""); // Reset the Employee ID input
      setEmpName(""); // Reset the Employee Name input
    } catch (error) {
      alert(`Error: ${error.message}`); // Show an alert for errors
    } finally {
      setLoading(false); // Set the loading state to false after submission
    }
  };

  // JSX: Render the Admin interface
  return (
    <div className="admin-container">
      {/* Header Section */}
      <div className="header">
        <img src={SKPLogo} alt="SKP Logo" className="logo" />
        <h2 className="header-title">Admin Interface</h2>
      </div>

      {/* Admin Interface Section */}
      <div className="admin-interface">
        {/* Invite Next Patient Button */}
        <button
          onClick={handleInviteNextPatient}
          style={{ marginBottom: "20px" }}
        >
          Invite Next Patient
        </button>

        {/* Register New Patient Form */}
        <form onSubmit={handleRegisterPatient} className="register-form">
          <input
            type="text"
            placeholder="Enter Employee ID"
            value={empID}
            onChange={(e) => setEmpID(e.target.value)} // Update Employee ID state
            required
          />
          <input
            type="text"
            placeholder="Enter Employee Name"
            value={empName}
            onChange={(e) => setEmpName(e.target.value)} // Update Employee Name state
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register New Patient"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin; // Export the Admin component
