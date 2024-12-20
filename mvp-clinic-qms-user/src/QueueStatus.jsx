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
        const userID = localStorage.getItem("employeeID");
        console.log("Fetched Employee ID:", userID);
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
    <div className="queue-status-page">
      <div className="queue-status-container">
        <h1>Your Ticket Number is</h1>
        {loading ? (
          <p>Loading your ticket...</p>
        ) : (
          <div className="current-serving-card">{queueNumber}</div>
        )}
        <p>Thank you for visiting our clinic</p>
        <p>Stay safe, stay healthy</p>
      </div>
    </div>
  );
};

export default QueueStatus;
