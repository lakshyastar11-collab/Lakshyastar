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
  query,
  orderBy
} from "firebase/firestore";

function App() {
  const auth = getAuth(app);

  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [date, setDate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [bonus, setBonus] = useState("");
  const [withdrawal, setWithdrawal] = useState("");

  const [entries, setEntries] = useState([]);

  // 🔥 LOAD DATA
  const loadData = async () => {
    const q = query(collection(db, "ledger"), orderBy("date", "asc"));
    const snap = await getDocs(q);

    const data = [];
    snap.forEach((doc) => {
      data.push(doc.data());
    });

    setEntries(data);
  };

  // 🔐 SIGNUP
  const signup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => alert("Signup Successful 🎉"))
      .catch((e) => alert(e.message));
  };

  // 🔐 LOGIN
  const login = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((res) => {
        setUser(res.user);
        loadData();
      })
      .catch((e) => alert(e.message));
  };

  // ➕ ADD ENTRY
  const addEntry = async () => {
    let prevClosing =
      entries.length > 0
        ? entries[entries.length - 1].closing
        : 0;

    let opening = prevClosing;

    let dep = Number(deposit);
    let bon = Number(bonus);
    let wit = Number(withdrawal);

    let expected = opening + dep + bon - wit;

    // 👉 SIMPLE RULE
    let closing = expected;

    let profit = 0;
    let loss = 0;

    if (closing > expected) {
      profit = closing - expected;
    } else if (closing < expected) {
      loss = expected - closing;
    }

    const newEntry = {
      date,
      opening,
      deposit: dep,
      bonus: bon,
      withdrawal: wit,
      closing,
      profit,
      loss,
    };

    await addDoc(collection(db, "ledger"), newEntry);

    setEntries([...entries, newEntry]);

    setDate("");
    setDeposit("");
    setBonus("");
    setWithdrawal("");
  };

  const totalProfit = entries.reduce((a, b) => a + b.profit, 0);
  const totalLoss = entries.reduce((a, b) => a + b.loss, 0);

  // 🔐 LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button onClick={signup}>Signup</button>
        <button onClick={login}>Login</button>
      </div>
    );
  }

  // 📊 DASHBOARD
  return (
    <div style={{ padding: 20 }}>
      <h2>Balance Ledger 📊</h2>

      <input type="date" onChange={(e) => setDate(e.target.value)} />
      <br /><br />

      <input placeholder="Deposit" onChange={(e) => setDeposit(e.target.value)} />
      <br /><br />

      <input placeholder="Bonus" onChange={(e) => setBonus(e.target.value)} />
      <br /><br />

      <input placeholder="Withdrawal" onChange={(e) => setWithdrawal(e.target.value)} />
      <br /><br />

      <button onClick={addEntry}>Add Entry</button>

      <hr />

      <h3>Total Profit: {totalProfit}</h3>
      <h3>Total Loss: {totalLoss}</h3>

      <hr />

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Date</th>
            <th>Opening</th>
            <th>Deposit</th>
            <th>Bonus</th>
            <th>Withdrawal</th>
            <th>Closing</th>
            <th>Profit</th>
            <th>Loss</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((e, i) => (
            <tr key={i}>
              <td>{e.date}</td>
              <td>{e.opening}</td>
              <td>{e.deposit}</td>
              <td>{e.bonus}</td>
              <td>{e.withdrawal}</td>
              <td>{e.closing}</td>
              <td>{e.profit}</td>
              <td>{e.loss}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;