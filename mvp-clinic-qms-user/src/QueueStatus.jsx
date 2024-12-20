import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./QueueStatus.css";

const QueueStatus = () => {
  const [queueNumber, setQueueNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueueNumber = async () => {
      try {
        const userID = localStorage.getItem("employeeID"); // Retrieve user ID stored during registration
        if (!userID) throw new Error("User not registered!");

        const queueRef = collection(db, "queue");
        const q = query(queueRef, where("employeeID", "==", userID));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setQueueNumber(userData.queueNumber);
        } else {
          setQueueNumber("N/A");
        }
      } catch (error) {
        console.error("Error fetching queue number:", error);
        setQueueNumber("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchQueueNumber();
  }, []);

  return (
    <div className="queue-page">
      <div className="queue-container">
        <img src="/src/SKP-logo.jpg" alt="SKP Logo" className="queue-logo" />
        <h2>Your Ticket Number is</h2>
        {loading ? (
          <p>Loading your ticket...</p>
        ) : (
          <div className="queue-number">{queueNumber}</div>
        )}
        <p className="queue-message">
          Thank you for visiting our clinic <br />
          Stay safe, stay healthy
        </p>
      </div>
    </div>
  );
};

export default QueueStatus;
