// Import React and necessary hooks
import React, { useState, useEffect } from "react";

// Import Firestore database utilities
import { db } from "./firebase";
import {
  collection,  // To access a Firestore collection
  query,       // To create a query for filtering documents
  where,       // To add query conditions
  orderBy,     // To sort the query results
  onSnapshot,  // Real-time listener for Firestore documents
  updateDoc,   // To update specific documents
  doc,         // To reference a Firestore document
} from "firebase/firestore";

// Import custom styles and logo
import "./Doctor.css";
import SKPLogo from "./SKP-logo.jpg";

// Define the Doctor functional component
function Doctor() {
  // State to hold patients fetched from Firestore
  const [patients, setPatients] = useState([]);

  // State to hold the currently selected patient for editing
  const [selectedPatient, setSelectedPatient] = useState(null);

  // State to hold selected note from dropdown
  const [selectedNote, setSelectedNote] = useState("");

  // State to hold custom note when "Others" is selected
  const [customNote, setCustomNote] = useState("");

  // Fetch real-time updates for patients with "waiting" or "being attended" statuses
  useEffect(() => {
    const patientsRef = collection(db, "queue"); // Reference to "queue" collection

    // Query for patients with specific statuses, ordered by timestamp
    const q = query(
      patientsRef,
      where("status", "in", ["waiting", "being attended"]),
      orderBy("timestamp", "asc")
    );

    // Real-time listener for Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Map Firestore documents to an array of patient objects
      const fetchedPatients = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(), // Spread document data fields
      }));
      setPatients(fetchedPatients); // Update the patients state
    });

    // Cleanup the real-time listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Select a patient to add or edit notes
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient); // Set the selected patient
    setSelectedNote("");         // Reset dropdown selection
    setCustomNote("");           // Reset custom note input
  };

  // Save notes for the selected patient
  const handleSaveNotes = async () => {
    if (!selectedPatient) return; // If no patient is selected, exit

    try {
      // Determine the note: dropdown note or custom input
      const notes =
        selectedNote === "Others" ? customNote : selectedNote || "No Notes";

      // Reference to the specific patient document in Firestore
      const patientRef = doc(db, "queue", selectedPatient.id);

      // Update the "notes" field in Firestore
      await updateDoc(patientRef, { notes });

      // Notify the user
      alert("Notes updated successfully!");

      // Reset states
      setSelectedPatient(null);
      setSelectedNote("");
      setCustomNote("");
    } catch (error) {
      alert("Failed to update notes. Try again.");
    }
  };

  // Mark the selected patient as "completed"
  const handleMarkAsCompleted = async () => {
    if (!selectedPatient) return; // If no patient is selected, exit

    try {
      // Reference to the specific patient document in Firestore
      const patientRef = doc(db, "queue", selectedPatient.id);

      // Update the "status" field to "completed"
      await updateDoc(patientRef, { status: "completed" });

      // Notify the user
      alert("Patient marked as completed!");

      // Reset states
      setSelectedPatient(null);
      setSelectedNote("");
      setCustomNote("");
    } catch (error) {
      alert("Failed to update status. Try again.");
    }
  };

  // JSX: Render the Doctor interface
  return (
    <div className="doctor-container">
      {/* Header with SKP Logo */}
      <div className="header">
        <img src={SKPLogo} alt="SKP Logo" className="logo" />
        <h2 className="header-title">Doctor Interface</h2>
      </div>

      {/* Section to display current patients */}
      <div className="patients-section">
        <h3>Current Patients</h3>
        {patients.length > 0 ? (
          <ul>
            {/* Map through the list of patients and display details */}
            {patients.map((patient) => (
              <li key={patient.id}>
                <strong>Employee ID:</strong> {patient.employeeID} <br />
                <strong>Name:</strong> {patient.name} <br />
                <strong>Status:</strong> {patient.status} <br />
                {/* Button to select a patient for notes */}
                <button onClick={() => handleSelectPatient(patient)}>
                  Add/Edit Notes
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No patients found.</p>
        )}
      </div>

      {/* Notes Section (only displayed if a patient is selected) */}
      {selectedPatient && (
        <div className="notes-section">
          <h3>Medical Notes for {selectedPatient.name}</h3>

          {/* Dropdown to select predefined notes */}
          <label htmlFor="notes">Select Medical Notes:</label>
          <select
            id="notes"
            value={selectedNote}
            onChange={(e) => setSelectedNote(e.target.value)}
          >
            <option value="">Select a note</option>
            <option value="Flu">Flu</option>
            <option value="Cough">Cough</option>
            <option value="Headache">Headache</option>
            <option value="Others">Others</option>
          </select>
          <br />

          {/* Custom input field if "Others" is selected */}
          {selectedNote === "Others" && (
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows="5"
              cols="40"
              placeholder="Enter custom medical notes here..."
            ></textarea>
          )}
          <br />

          {/* Buttons for actions */}
          <button className="save-button" onClick={handleSaveNotes}>
            Save
          </button>
          <button className="mark-completed-button" onClick={handleMarkAsCompleted}>
            Mark as Completed
          </button>
          <button onClick={() => setSelectedPatient(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default Doctor; // Export the Doctor component
