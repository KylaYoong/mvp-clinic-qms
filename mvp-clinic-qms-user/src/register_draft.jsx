// Import React and hooks (useState for state management)
import React, { useState } from "react";

// Import Firestore utilities and Firebase database reference
import { db } from "./firebase";
import { collection, doc, setDoc, Timestamp, query, getDocs } from "firebase/firestore";

// Import React Router's navigation hook
import { useNavigate } from "react-router-dom";

// Import custom CSS for styling
import "./Register.css";

// Define the Register functional component
const Register = () => {
  // State variables to hold the employee ID and name input values
  const [id, setId] = useState("");    // Holds Employee ID
  const [name, setName] = useState(""); // Holds Full Name
  const [email, setEmail] = useState(""); // New email state
  
  // Hook to programmatically navigate to a different route
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!id.match(/^\d{6}$/)) {
      alert("Employee ID must be exactly 6 digits!");
      return;
    }
    if (!name.match(/^[a-zA-Z ]+$/)) {
      alert("Name must contain only letters and spaces!");
      return;
    }
  
    try {
      // Generate the next queue number
      const queueCollection = collection(db, "queue");
      const queueSnapshot = await getDocs(queueCollection);
      const queueNumbers = queueSnapshot.docs.map(doc => parseInt(doc.data().queueNumber.replace('D', ''), 10));
      const nextQueueNumber = Math.max(0, ...queueNumbers) + 1;
      const queueNumber = `D${String(nextQueueNumber).padStart(4, "0")}`;
      
  
      // Save the document
      const patientRef = doc(queueCollection, id);
      await setDoc(patientRef, {
        employeeID: id,
        name: name,
        email: email || null,
        queueNumber: queueNumber, // Save queue number
        status: "waiting",
        timestamp: Timestamp.now(),
      });
  
      alert(`Your queue number is ${queueNumber}`);
      setId("");
      setName("");
      setEmail("");
      navigate("/queue-status");
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error: Unable to register. Please try again.");
    }
  };
  

  // JSX: Render the registration form UI
  return (
    <div className="register-page"> {/* Main wrapper */}
      <div className="overall">
        {/* Logo Section */}
        <div className="logo-group">
          <header className="register-header">
            <img src="/src/SKP-logo.jpg" alt="SKP Logo" className="logo" />
          </header>
        </div>

        {/* Form Content */}
        <div className="content">
          <div className="container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}> {/* Form submission triggers handleSubmit */}
              {/* Employee ID Field */}
              <div className="form-group">
                <label htmlFor="id">Employee ID</label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)} // Updates 'id' state on change
                  required
                />
              </div>

              {/* Full Name Field */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)} // Updates 'name' state on change
                  required
                />
              </div>

              {/* Optional Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email (Optional)</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; // Export the Register component
