import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import "./TVDisplay.css";

const TVDisplay = () => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const queueQuery = query(
      collection(db, "queue"),
      where("status", "in", ["waiting", "being attended"]),
      orderBy("status", "desc"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(queueQuery, (snapshot) => {
      const queueData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQueue(queueData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="tv-display">
      <h1>Queue Status</h1>
      <div className="queue-list">
        {queue.map((user) => (
          <div key={user.id} className="queue-card">
            <p>{user.queueNumber}</p>
            <p>{user.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TVDisplay;
