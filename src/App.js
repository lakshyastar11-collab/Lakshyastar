import { useState } from "react";
import { app, db } from "./firebase";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [date, setDate] = useState("");
  const [profit, setProfit] = useState("");
  const [loss, setLoss] = useState("");
  const [entries, setEntries] = useState([]);

  const auth = getAuth(app);

  // 🔵 FETCH DATA
  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "entries"));

    const data = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    setEntries(data);
  };

  // 🔵 LOGIN
  const login = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user);

        fetchData();

        alert("Login Successful 🎉");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  // 🟢 SIGNUP
  const signup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Account Created 🎉");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  // 📊 ADD ENTRY
  const addEntry = async () => {
    await addDoc(collection(db, "entries"), {
      date,
      profit: Number(profit),
      loss: Number(loss),
    });

    alert("Data Saved 🎉");

    fetchData();

    setDate("");
    setProfit("");
    setLoss("");
  };

  // 📈 TOTAL
  const totalProfit = entries.reduce(
    (sum, item) => sum + item.profit,
    0
  );

  const totalLoss = entries.reduce(
    (sum, item) => sum + item.loss,
    0
  );

  const net = totalProfit - totalLoss;

  // 🎉 LOGIN SUCCESS SCREEN
  if (user) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h1>Welcome 🎉</h1>

        <h2>Loss / Profit Tracker 📊</h2>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Profit"
          value={profit}
          onChange={(e) => setProfit(e.target.value)}
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Loss"
          value={loss}
          onChange={(e) => setLoss(e.target.value)}
        />

        <br />
        <br />

        <button onClick={addEntry}>Add Entry</button>

        <hr />

        <h3>Total Profit: {totalProfit}</h3>

        <h3>Total Loss: {totalLoss}</h3>

        <h2>Net: {net}</h2>

        <hr />

        {entries.map((item, index) => (
          <div key={index}>
            <p>Date: {item.date}</p>

            <p>Profit: {item.profit}</p>

            <p>Loss: {item.loss}</p>

            <hr />
          </div>
        ))}
      </div>
    );
  }

  // 🔐 LOGIN SCREEN
  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <h1>Lakshyastar</h1>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={signup}>Sign Up</button>

      <button onClick={login}>Login</button>
    </div>
  );
}

export default App;