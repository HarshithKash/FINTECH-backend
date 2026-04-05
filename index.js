const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors({ origin: '*', allowedHeaders: ['Content-Type', 'role'] }));
app.use(express.json());
app.use(morgan('dev'));

// --- ROLE-BASED ACCESS CONTROL MIDDLEWARE ---
// Enforces security policies based on the 'role' header.
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers.role?.toLowerCase();

    if (!userRole) {
      return res.status(401).json({ error: "Unauthorized: Please provide a 'role' header." });
    }

    if (allowedRoles.includes(userRole)) {
      next(); // Access granted
    } else {
      res.status(403).json({
        error: `Forbidden: Access Denied for '${userRole}' role.`,
        requiredAccess: allowedRoles
      });
    }
  };
};

// --- ROUTES ---

// 1. DYNAMIC TEST PAGE (Demonstrates all logic visually)
app.get('/', (req, res) => {
  res.send(`
      <style>body{font-family:sans-serif;line-height:1.6;padding:20px;max-width:900px;margin:auto}pre{background:#eee;padding:15px;border-radius:4px;overflow:auto}button{padding:10px 15px;margin:4px;cursor:pointer;border:none;border-radius:4px;background:#007bff;color:#fff}input{padding:8px;margin-right:5px;border:1px solid #ccc;border-radius:4px}</style>
      <h1> Zorvyn Finance: Role-Based System Demo</h1>
      
      <div style="border:1px solid #ddd; padding:20px; border-radius:10px; background:#f4f7f6">
        <h3> Active Role Selection</h3>
        <p>1. Select a role to log in:</p>
        <button id="btn-viewer" onclick="selectRole('viewer')">Log in as Viewer</button>
        <button id="btn-analyst" onclick="selectRole('analyst')">Log in as Analyst</button>
        <button id="btn-admin" onclick="selectRole('admin')" style="background:#d9534f">Log in as Admin</button>
        <div id="statusLine" style="margin-top:10px; font-weight:bold; color:#666;">Current Role: NONE (Select one above)</div>

        <div style="border-top:2px solid #ccc; margin-top:20px; padding-top:20px;">
          <h3>  Data Management Control</h3>
          <p>2. Attempt actions with your active role:</p>
          Target ID: <input type="number" id="targetId" value="1" style="width:60px">
          Amount: <input type="number" id="newAmount" value="1000" style="width:100px">
          <br><br>
          <button onclick="testAPI('/dashboard')">View Summary</button>
          <button onclick="testAPI('/records')">View Insights/Records</button>
          <button onclick="interactiveUpdate()" style="background:#5bc0de">Update Record</button>
          <button onclick="interactiveDelete()" style="background:#d9534f">Delete Record</button>
        </div>

        <pre id="output" style="margin-top:20px">Select a role and then choose an action...</pre>
      </div>

      <script>
        const APP_URL = window.location.origin;
        let currentRole = null;

        function selectRole(role) {
            currentRole = role;
            document.getElementById('statusLine').innerText = 'Current Role: ' + role.toUpperCase();
            document.getElementById('output').innerText = 'Switched to ' + role.toUpperCase() + ' mode.';
            
            // Highlight active button
            ['viewer', 'analyst', 'admin'].forEach(r => {
                document.getElementById('btn-' + r).style.opacity = (r === role ? '1' : '0.5');
            });
        }

        function showResult(title, data, isError=false) {
            const output = document.getElementById('output');
            output.innerText = title + ':\\n' + JSON.stringify(data, null, 2);
            output.style.color = isError ? 'red' : 'green';
        }

        async function testAPI(endpoint) {
            if(!currentRole) { alert('Please select a role first!'); return; }
            document.getElementById('output').innerText = 'Connecting...';
            try {
                const res = await fetch(APP_URL + endpoint, { headers: { 'role': currentRole } });
                const data = await res.json();
                if(!res.ok) { 
                    alert(' Access Denied (' + res.status + '): ' + data.error);
                    showResult('FAILED', data, true);
                } else {
                    showResult('SUCCESS (' + currentRole.toUpperCase() + ')', data);
                }
            } catch(e) { alert('ERROR: ' + e.message); }
        }

        async function interactiveUpdate() {
            if(!currentRole) { alert('Please select a role first!'); return; }
            const id = document.getElementById('targetId').value;
            const amount = document.getElementById('newAmount').value;
            try {
                const res = await fetch(APP_URL + '/records/' + id, { 
                    method: 'PATCH',
                    headers: { 'role': currentRole, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: parseFloat(amount), notes: 'Update Test' })
                });
                const data = await res.json();
                if(!res.ok) { 
                    alert(' Access Blocked (' + res.status + '): ' + (data.error || 'Forbidden'));
                    showResult('UPDATE FAILED', data, true);
                } else {
                    alert('Record Updated Successfully!');
                    showResult('UPDATE SUCCESS', data);
                }
            } catch(e) { alert('ERROR: ' + e.message); }
        }

        async function interactiveDelete() {
            if(!currentRole) { alert('Please select a role first!'); return; }
            const id = document.getElementById('targetId').value;
            if(!confirm('Delete record ' + id + '?')) return;
            try {
                const res = await fetch(APP_URL + '/records/' + id, { method: 'DELETE', headers: { 'role': currentRole } });
                const data = await res.json();
                if(!res.ok) { 
                    alert(' Forbidden (' + res.status + '): ' + data.error);
                    showResult('DELETE FAILED', data, true);
                } else {
                    alert('Record Deleted Successfully!');
                    showResult('DELETE SUCCESS', data);
                }
            } catch(e) { alert('ERROR: ' + e.message); }
        }
      </script>
    `);
});

// 2. DASHBOARD API (Aggregated View)
// Viewer, Analyst, Admin can access.
app.get('/dashboard', checkRole(['viewer', 'analyst', 'admin']), async (req, res) => {
  try {
    const income = await prisma.financialRecord.aggregate({ where: { type: 'income' }, _sum: { amount: true } });
    const expense = await prisma.financialRecord.aggregate({ where: { type: 'expense' }, _sum: { amount: true } });
    const inc = income._sum.amount || 0;
    const exp = expense._sum.amount || 0;
    res.json({ totalIncome: inc, totalExpense: exp, netBalance: inc - exp });
  } catch (e) { res.status(500).json({ error: "Failed to load summary data." }); }
});

// 3. RECORDS & INSIGHTS API
// Analyst & Admin only. (Viewers see 403 Forbidden)
app.get('/records', checkRole(['analyst', 'admin']), async (req, res) => {
  try {
    const records = await prisma.financialRecord.findMany({ orderBy: { date: 'desc' } });
    // Insight logic: Category-wise breakdown
    const insights = await prisma.financialRecord.groupBy({ by: ['category'], _sum: { amount: true } });
    res.json({ records, insights });
  } catch (e) { res.status(500).json({ error: "Failed to load insights." }); }
});

// 4. ADMIN ONLY CRUD (Create/Update/Delete)
app.patch('/records/:id', checkRole(['admin']), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid record ID" });
  try {
    const updated = await prisma.financialRecord.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (e) { res.status(404).json({ error: "Record not found." }); }
});

app.delete('/records/:id', checkRole(['admin']), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  try {
    await prisma.financialRecord.delete({ where: { id } });
    res.json({ message: "Record permanently removed from database." });
  } catch (e) { res.status(404).json({ error: "Record not found." }); }
});

// 5. USER MANAGEMENT (Admin only)
app.get('/users', checkRole(['admin']), async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// --- SERVER INITIALIZATION ---
app.listen(PORT, () => {
  console.log(` Final Zorvyn Backend running at http://localhost:${PORT}`);
  console.log(`Multi-Level Access Control is ACTIVE`);
});
