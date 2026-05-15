import { useState } from "react";
import { saveAs } from "file-saver";
import { app, db } from "./firebase";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
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
  const [closing, setClosing] = useState("");

  const [entries, setEntries] = useState([]);

  const [search, setSearch] = useState("");

  const loadData = async () => {

    const q = query(
      collection(db, "ledger"),
      orderBy("date", "desc")
    );

    const snap = await getDocs(q);

    const data = [];

    snap.forEach((docSnap) => {
      data.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    setEntries(data);
  };

  const signup = () => {

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => alert("Signup Successful 🎉"))
      .catch((e) => alert(e.message));
  };

  const login = () => {

    signInWithEmailAndPassword(auth, email, password)
      .then((res) => {
        setUser(res.user);
        loadData();
      })
      .catch((e) => alert(e.message));
  };

  const logout = async () => {

    await signOut(auth);
    setUser(null);
    alert("Logout Successful 👋");
  };

  // MAIN RULE LOGIC
  const addEntry = async () => {

    let prevClosing =
      entries.length > 0 ? entries[0].closing : 0;

    let opening = Number(prevClosing);

    let dep = Number(deposit || 0);
    let bon = Number(bonus || 0);
    let wit = Number(withdrawal || 0);
    let clos = Number(closing || 0);

    let leftSide = opening + dep;
    let rightSide = bon + wit + clos;

    let profit = 0;
    let loss = 0;

    if (leftSide < rightSide) {
      profit = rightSide - leftSide;
    } else if (leftSide > rightSide) {
      loss = leftSide - rightSide;
    }

    const newEntry = {
      date,
      opening,
      deposit: dep,
      bonus: bon,
      withdrawal: wit,
      closing: clos,
      profit,
      loss,
    };

    const docRef = await addDoc(
      collection(db, "ledger"),
      newEntry
    );

    setEntries([
      { id: docRef.id, ...newEntry },
      ...entries
    ]);

    setDate("");
    setDeposit("");
    setBonus("");
    setWithdrawal("");
    setClosing("");
  };

  const deleteEntry = async (id) => {

    const confirmDelete = window.confirm("Delete this entry?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "ledger", id));

    setEntries(entries.filter((e) => e.id !== id));
  };

  const exportCSV = () => {

    let csvData =
      "Date,Opening,Deposit,Bonus,Withdrawal,Closing,Profit,Loss\n";

    entries.forEach((e) => {
      csvData +=
        '${e.date},${e.opening},${e.deposit},${e.bonus},${e.withdrawal},${e.closing},${e.profit},${e.loss}\n';
    });

    const blob = new Blob([csvData], {
      type: "text/csv;charset=utf-8;"
    });

    saveAs(blob, "ledger-data.csv");
  };

  // TOTALS
  const totalProfit = entries.reduce((a, b) => a + b.profit, 0);
  const totalLoss = entries.reduce((a, b) => a + b.loss, 0);
  const totalDeposit = entries.reduce((a, b) => a + b.deposit, 0);
  const totalBonus = entries.reduce((a, b) => a + b.bonus, 0);
  const totalWithdrawal = entries.reduce((a, b) => a + b.withdrawal, 0);

  const currentBalance =
    entries.length > 0 ? entries[0].closing : 0;

  const filteredEntries = entries.filter((e) =>
    e.date.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="card p-4 shadow">

          <h2 className="text-center mb-4">Login</h2>

          <input className="form-control mb-3" placeholder="Email"
            onChange={(e) => setEmail(e.target.value)} />

          <input className="form-control mb-3" type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)} />

          <button className="btn btn-warning w-100 mb-2" onClick={signup}>
            Signup
          </button>

          <button className="btn btn-success w-100" onClick={login}>
            Login
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      <div className="card p-4 shadow">

        <div className="d-flex justify-content-between mb-3">

          <h2>Balance Ledger 📊</h2>

          <button className="btn btn-dark" onClick={logout}>
            Logout
          </button>

        </div>

        <h4>Current Balance: ₹{currentBalance}</h4>

        <hr />

        <input className="form-control mb-2" type="date"
          value={date} onChange={(e) => setDate(e.target.value)} />

        <input className="form-control mb-2" placeholder="Deposit"
          value={deposit} onChange={(e) => setDeposit(e.target.value)} />

        <input className="form-control mb-2" placeholder="Bonus"
          value={bonus} onChange={(e) => setBonus(e.target.value)} />

        <input className="form-control mb-2" placeholder="Withdrawal"
          value={withdrawal} onChange={(e) => setWithdrawal(e.target.value)} />

        <input className="form-control mb-2" placeholder="Closing"
          value={closing} onChange={(e) => setClosing(e.target.value)} />

        <button className="btn btn-primary w-100" onClick={addEntry}>
          Add Entry
        </button>

        <hr />

        <div className="row text-center">

          <div className="col-md-2"><h6>Profit</h6><p>₹{totalProfit}</p></div>
          <div className="col-md-2"><h6>Loss</h6><p>₹{totalLoss}</p></div>
          <div className="col-md-2"><h6>Deposit</h6><p>₹{totalDeposit}</p></div>
          <div className="col-md-2"><h6>Bonus</h6><p>₹{totalBonus}</p></div>
          <div className="col-md-2"><h6>Withdrawal</h6><p>₹{totalWithdrawal}</p></div>

        </div>

      </div>

      <input className="form-control mt-3 mb-3"
        placeholder="Search by Date"
        onChange={(e) => setSearch(e.target.value)} />

      <table className="table table-bordered table-striped">

        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Opening</th>
            <th>Deposit</th>
            <th>Bonus</th>
            <th>Withdrawal</th>
            <th>Closing</th>
            <th>Profit</th>
            <th>Loss</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredEntries.map((e) => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.opening}</td>
              <td>{e.deposit}</td>
              <td>{e.bonus}</td>
              <td>{e.withdrawal}</td>
              <td>{e.closing}</td>
              <td>{e.profit}</td>
              <td>{e.loss}</td>
              <td>
                <button className="btn btn-danger btn-sm"
                  onClick={() => deleteEntry(e.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default App;