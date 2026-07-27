const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads-ziyata-konveksi');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'konveksi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Database Connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// JWT Middleware Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak, token tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid' });
    }
    req.user = user;
    next();
  });
};

// Admin Only Middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Akses ditolak, hanya Admin yang diizinkan' });
  }
};

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET PROFILE
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, name, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. USER MANAGEMENT ENDPOINTS (ADMIN)
// ==========================================

// GET USERS (Support Pagination, Search, Role Filter)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', role = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND (username LIKE ? OR name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    // Count Total
    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const total = countResult[0].total;

    // Fetch Data
    const query = `SELECT id, username, name, role, created_at FROM users ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE USER (Pekerja / Admin)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password || !name || !role) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    // Check duplicate
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, role]
    );

    res.json({
      success: true,
      message: 'Akun pekerja berhasil dibuat',
      data: { id: result.insertId, username, name, role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE USER
app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, role, password } = req.body;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET username = ?, name = ?, role = ?, password = ? WHERE id = ?',
        [username, name, role, hashedPassword, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET username = ?, name = ?, role = ? WHERE id = ?',
        [username, name, role, id]
      );
    }

    res.json({ success: true, message: 'Data pekerja berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE USER
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'Pekerja berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. MASTER MODEL & HARGA BORONG ENDPOINTS
// ==========================================

// GET ALL MODELS
app.get('/api/models', authenticateToken, async (req, res) => {
  try {
    let { page = 1, limit = 50, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];
    if (search) {
      whereClause += ' AND model_name LIKE ?';
      params.push(`%${search}%`);
    }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM models ${whereClause}`, params);
    const total = countResult[0].total;

    const query = `SELECT * FROM models ${whereClause} ORDER BY model_name ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE MODEL
app.post('/api/models', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { model_name, description } = req.body;
    if (!model_name) {
      return res.status(400).json({ success: false, message: 'Nama model wajib diisi' });
    }
    const [result] = await pool.query(
      'INSERT INTO models (model_name, description) VALUES (?, ?)',
      [model_name, description || null]
    );
    res.json({ success: true, message: 'Model baru berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE MODEL
app.put('/api/models/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { model_name, description } = req.body;
    await pool.query('UPDATE models SET model_name = ?, description = ? WHERE id = ?', [model_name, description, id]);
    res.json({ success: true, message: 'Model berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE MODEL
app.delete('/api/models/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM models WHERE id = ?', [id]);
    res.json({ success: true, message: 'Model berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET PIECE RATES (Harga Borong per Pcs)
app.get('/api/piece-rates', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT pr.id, pr.model_id, m.model_name, pr.role, pr.price_per_piece
      FROM piece_rates pr
      JOIN models m ON pr.model_id = m.id
      ORDER BY m.model_name ASC, pr.role ASC
    `;
    const [rows] = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SAVE/UPSERT PIECE RATE (Supports both Batch and Single update)
app.post('/api/piece-rates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { model_id, rates } = req.body;
    
    // If rates is an object, do a batch save
    if (model_id && rates && typeof rates === 'object') {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        for (const [role, price] of Object.entries(rates)) {
          const priceVal = parseFloat(price);
          if (isNaN(priceVal) || priceVal < 0) continue;
          
          const query = `
            INSERT INTO piece_rates (model_id, role, price_per_piece)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE price_per_piece = VALUES(price_per_piece)
          `;
          await connection.query(query, [model_id, role, priceVal]);
        }
        await connection.commit();
        return res.json({ success: true, message: 'Semua harga borong berhasil diperbarui' });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    // Fallback: Single save
    const { role, price_per_piece } = req.body;
    if (!model_id || !role || price_per_piece === undefined) {
      return res.status(400).json({ success: false, message: 'Field model, role, dan harga wajib diisi' });
    }

    const query = `
      INSERT INTO piece_rates (model_id, role, price_per_piece)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE price_per_piece = VALUES(price_per_piece)
    `;
    await pool.query(query, [model_id, role, price_per_piece]);

    res.json({ success: true, message: 'Harga borong per pcs berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE/RESET PIECE RATES FOR A MODEL
app.delete('/api/piece-rates/:model_id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { model_id } = req.params;
    await pool.query('DELETE FROM piece_rates WHERE model_id = ?', [model_id]);
    res.json({ success: true, message: 'Semua harga borong untuk model ini berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. WORK LOGS ENDPOINTS (PEKERJA & ADMIN)
// ==========================================

// GET WORK LOGS (Support Pagination, Search, Filter Tanggal, Worker, Role)
app.get('/api/work-logs', authenticateToken, async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', date_from = '', date_to = '', worker_id = '', role = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Jika pekerja biasa, hanya bisa melihat rekapan pekerjaannya sendiri (kecuali admin)
    if (req.user.role !== 'admin') {
      whereClause += ' AND wl.worker_id = ?';
      params.push(req.user.id);
    } else if (worker_id) {
      whereClause += ' AND wl.worker_id = ?';
      params.push(worker_id);
    }

    if (role) {
      whereClause += ' AND u.role = ?';
      params.push(role);
    }

    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.username LIKE ? OR m.model_name LIKE ? OR wl.fabric_type LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (date_from) {
      whereClause += ' AND wl.work_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND wl.work_date <= ?';
      params.push(date_to);
    }

    // Count Total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM work_logs wl
      JOIN users u ON wl.worker_id = u.id
      JOIN models m ON wl.model_id = m.id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Data Query
    const dataQuery = `
      SELECT 
        wl.id,
        wl.worker_id,
        u.username as worker_username,
        u.name as worker_name,
        u.role as worker_role,
        wl.work_date,
        wl.model_id,
        m.model_name,
        wl.quantity_pcs,
        wl.fabric_type,
        wl.fabric_weight_kg,
        wl.work_location,
        wl.notes,
        COALESCE(pr.price_per_piece, 0) as price_per_piece,
        (wl.quantity_pcs * COALESCE(pr.price_per_piece, 0)) as total_pay,
        wl.created_at
      FROM work_logs wl
      JOIN users u ON wl.worker_id = u.id
      JOIN models m ON wl.model_id = m.id
      LEFT JOIN piece_rates pr ON (pr.model_id = wl.model_id AND pr.role = u.role)
      ${whereClause}
      ORDER BY wl.work_date DESC, wl.id DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await pool.query(dataQuery, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE WORK LOG (Input Rekap Kerja Harian Pekerja)
app.post('/api/work-logs', authenticateToken, async (req, res) => {
  try {
    const { work_date, model_id, quantity_pcs, fabric_type, fabric_weight_kg, work_location, notes } = req.body;

    // Worker ID diambil dari token login jika pekerja, atau boleh diatur admin jika admin
    const worker_id = req.user.role === 'admin' && req.body.worker_id ? req.body.worker_id : req.user.id;

    // Ambil role worker dari database jika diinput oleh admin
    let worker_role = req.user.role;
    if (req.user.role === 'admin' && req.body.worker_id) {
      const [workerRows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.body.worker_id]);
      if (workerRows.length > 0) {
        worker_role = workerRows[0].role;
      }
    }

    if (!work_date || !model_id || !quantity_pcs) {
      return res.status(400).json({ success: false, message: 'Tanggal, Model, dan Jumlah (pcs) wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO work_logs (worker_id, work_date, model_id, quantity_pcs, fabric_type, fabric_weight_kg, work_location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        worker_id,
        work_date,
        model_id,
        parseInt(quantity_pcs),
        fabric_type || null,
        fabric_weight_kg ? parseFloat(fabric_weight_kg) : null,
        worker_role === 'obras' ? (work_location || 'Di Tempat Kerja') : null,
        notes || null
      ]
    );

    res.json({
      success: true,
      message: 'Rekap pengerjaan harian berhasil disimpan',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE WORK LOG
app.delete('/api/work-logs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Worker hanya bisa hapus miliknya sendiri
    if (req.user.role !== 'admin') {
      const [log] = await pool.query('SELECT worker_id FROM work_logs WHERE id = ?', [id]);
      if (log.length === 0 || log[0].worker_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Tidak dapat menghapus data ini' });
      }
    }

    await pool.query('DELETE FROM work_logs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Rekap pengerjaan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. SALARY REPORT & SUMMARY ENDPOINTS (ADMIN)
// ==========================================

// GET SALARY REPORT
app.get('/api/reports/salary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date_from, date_to, role } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (date_from) {
      whereClause += ' AND wl.work_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      whereClause += ' AND wl.work_date <= ?';
      params.push(date_to);
    }
    if (role) {
      whereClause += ' AND u.role = ?';
      params.push(role);
    }

    const query = `
      SELECT 
        u.id as worker_id,
        u.username,
        u.name as worker_name,
        u.role as worker_role,
        COUNT(DISTINCT wl.id) as total_submissions,
        COALESCE(SUM(wl.quantity_pcs), 0) as total_pcs,
        COALESCE(SUM(wl.quantity_pcs * COALESCE(pr.price_per_piece, 0)), 0) as total_salary
      FROM users u
      LEFT JOIN work_logs wl ON u.id = wl.worker_id ${date_from || date_to ? 'AND ' + whereClause.replace('WHERE 1=1 AND ', '') : ''}
      LEFT JOIN piece_rates pr ON (pr.model_id = wl.model_id AND pr.role = u.role)
      WHERE u.role != 'admin' ${role ? 'AND u.role = ?' : ''}
      GROUP BY u.id, u.username, u.name, u.role
      ORDER BY total_salary DESC
    `;

    const reportParams = role ? [role] : [];
    if (date_from) reportParams.unshift(date_from);
    if (date_to) reportParams.unshift(date_to);

    const [rows] = await pool.query(query, reportParams);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET DASHBOARD SUMMARY (Stats)
app.get('/api/reports/summary', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    let todayPcs = 0;
    let monthPcs = 0;
    let totalWorkers = 0;

    if (req.user.role === 'admin') {
      const [todayRes] = await pool.query('SELECT COALESCE(SUM(quantity_pcs), 0) as total FROM work_logs WHERE work_date = ?', [today]);
      todayPcs = todayRes[0].total;

      const [monthRes] = await pool.query('SELECT COALESCE(SUM(quantity_pcs), 0) as total FROM work_logs WHERE MONTH(work_date) = MONTH(CURRENT_DATE()) AND YEAR(work_date) = YEAR(CURRENT_DATE())');
      monthPcs = monthRes[0].total;

      const [workerRes] = await pool.query("SELECT COUNT(*) as total FROM users WHERE role != 'admin'");
      totalWorkers = workerRes[0].total;
    } else {
      const [todayRes] = await pool.query('SELECT COALESCE(SUM(quantity_pcs), 0) as total FROM work_logs WHERE worker_id = ? AND work_date = ?', [req.user.id, today]);
      todayPcs = todayRes[0].total;

      const [monthRes] = await pool.query('SELECT COALESCE(SUM(quantity_pcs), 0) as total FROM work_logs WHERE worker_id = ? AND MONTH(work_date) = MONTH(CURRENT_DATE()) AND YEAR(work_date) = YEAR(CURRENT_DATE())', [req.user.id]);
      monthPcs = monthRes[0].total;
    }

    res.json({
      success: true,
      summary: {
        todayPcs,
        monthPcs,
        totalWorkers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
