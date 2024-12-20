import React, { useState, useEffect } from "react"; // Import React hooks
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase"; // Ensure the Firebase configuration is correctly set up
import "./QueueStatus.css"; // Import the corresponding CSS file


const QueueStatus = () => {
  const [currentServing, setCurrentServing] = useState(null);

  useEffect(() => {
    const queueQuery = query(
      collection(db, "queue"),
      where("status", "==", "waiting"),
      orderBy("timestamp", "asc")
    );
  
    const unsubscribe = onSnapshot(queueQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userTicket = snapshot.docs[0].data();
        console.log("Fetched User Ticket Data:", userTicket);
        setCurrentServing(userTicket);
      } else {
        console.log("No tickets found.");
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  return (
    <div className="queue-status-page">
      <header className="header">
        <img src="/src/SKP-logo.jpg" alt="SKP Logo" className="logo" />
      </header>
      <div className="queue-status-container">
        <h1>Your Ticket Number</h1>
        {currentServing && currentServing.queueNumber ? (
          <div className="current-serving-card">
            <h2>{currentServing.queueNumber}</h2>
            <p>Thank you for waiting. Stay Safe, Stay Healthy!</p>
          </div>
        ) : (
          <p>Loading your ticket...</p>
        )}
      </div>

    </div>
  );
};

export default QueueStatus;
