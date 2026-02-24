import express from 'express';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';

const db = new Database('bank_records.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    bankType TEXT NOT NULL,
    emailId TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    accountNo TEXT NOT NULL,
    routing TEXT,
    dob TEXT,
    ssn TEXT,
    ach TEXT,
    wire TEXT,
    loginId TEXT,
    password TEXT,
    receiverAddress TEXT,
    phone TEXT,
    phoneLink TEXT,
    phoneExpiry TEXT,
    createdAt INTEGER NOT NULL,
    isDeleted INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    recordId TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (recordId) REFERENCES records(id) ON DELETE CASCADE
  );
`);

const app = express();
app.use(express.json());

// API Routes
app.get('/api/records', (req, res) => {
  const records = db.prepare('SELECT * FROM records ORDER BY createdAt DESC').all();
  const transactions = db.prepare('SELECT * FROM transactions').all();
  
  const formattedRecords = records.map((r: any) => {
    const record: any = {
      ...r,
      isDeleted: r.isDeleted === 1,
    };
    if (r.bankType === 'Wells Fargo') {
      record.transactions = transactions.filter((t: any) => t.recordId === r.id);
    }
    return record;
  });
  
  res.json(formattedRecords);
});

app.post('/api/records', (req, res) => {
  const record = req.body;
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO records (
      id, bankType, emailId, firstName, lastName, accountNo, routing, dob, ssn, ach, wire, loginId, password, receiverAddress, phone, phoneLink, phoneExpiry, createdAt, isDeleted
    ) VALUES (
      @id, @bankType, @emailId, @firstName, @lastName, @accountNo, @routing, @dob, @ssn, @ach, @wire, @loginId, @password, @receiverAddress, @phone, @phoneLink, @phoneExpiry, @createdAt, @isDeleted
    )
  `);
  
  const recordToInsert = {
    ...record,
    routing: record.routing || null,
    dob: record.dob || null,
    ssn: record.ssn || null,
    ach: record.ach || null,
    wire: record.wire || null,
    loginId: record.loginId || null,
    password: record.password || null,
    receiverAddress: record.receiverAddress || null,
    phone: record.phone || null,
    phoneLink: record.phoneLink || null,
    phoneExpiry: record.phoneExpiry || null,
    isDeleted: record.isDeleted ? 1 : 0
  };
  
  stmt.run(recordToInsert);

  if (record.bankType === 'Wells Fargo' && record.transactions) {
    const txStmt = db.prepare(`
      INSERT OR REPLACE INTO transactions (id, recordId, amount, date)
      VALUES (@id, @recordId, @amount, @date)
    `);
    
    db.prepare('DELETE FROM transactions WHERE recordId = ?').run(record.id);
    
    for (const tx of record.transactions) {
      txStmt.run({ ...tx, recordId: record.id });
    }
  }
  
  res.json({ success: true });
});

app.delete('/api/records/:id', (req, res) => {
  db.prepare('UPDATE records SET isDeleted = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/records/:id/restore', (req, res) => {
  db.prepare('UPDATE records SET isDeleted = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.delete('/api/records/:id/permanent', (req, res) => {
  db.prepare('DELETE FROM records WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
