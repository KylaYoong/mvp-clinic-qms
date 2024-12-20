import React, { useState, useEffect } from 'react';

const ClinicDisplay = () => {
  const [currentPatient, setCurrentPatient] = useState(405396);
  const [upcomingPatients, setUpcomingPatients] = useState([]); // Initialize as an empty array
  const [waitTime, setWaitTime] = useState(25);

  // Fetch initial data (replace with your actual API call)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/patients'); // Replace with your API endpoint
        const data = await response.json();
        setUpcomingPatients(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error gracefully (e.g., display an error message)
      }
    };

    fetchData();
  }, []);

  // Simulate real-time updates (replace with your actual data fetching logic)
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update current patient (replace with your actual logic)
      setCurrentPatient(prevPatient => prevPatient + 1); 

      // Update upcoming patients (replace with your actual logic)
      // This is a simplified example, replace with your actual API call/logic
      setUpcomingPatients(prevPatients => {
        // Remove the current patient from the list
        const updatedPatients = prevPatients.filter(patient => patient.number !== currentPatient);
        // Add a new patient to the end of the list (replace with your actual logic)
        return [...updatedPatients, { number: prevPatients[prevPatients.length - 1].number + 1, name: 'New Patient' }];
      });

      // Update wait time (replace with your actual logic)
      setWaitTime(Math.max(0, waitTime - 1));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, [currentPatient, upcomingPatients, waitTime]);

  return (
    <div className="clinic-display">
      <h1>SKP Panel Clinic</h1>
      <div className="current-patient">
        <h2>Now Serving: {currentPatient}</h2>
      </div>
      <div className="upcoming-patients">
        <h3>Upcoming Patients:</h3>
        <ul>
          {upcomingPatients.map(patient => (
            <li key={patient.number}>{patient.number} - {patient.name}</li>
          ))}
        </ul>
      </div>
      <div className="wait-time">
        <p>Estimated Wait Time: {waitTime} Minutes</p>
      </div>
    </div>
  );
};

export default ClinicDisplay;