const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.')); // để frontend load được file html/js

// Đường dẫn file database
const DB_PATH = './database.json';

// GET - lấy tất cả bookings
app.get('/api/bookings', (req, res) => {
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Đọc file lỗi!' });
        const db = JSON.parse(data || '{"bookings":[]}');
        res.json(db.bookings || []);
    });
});

// POST - thêm booking mới
app.post('/api/bookings', (req, res) => {
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        let db = { bookings: [] };
        if (!err && data) db = JSON.parse(data);
        const newBooking = req.body;
        db.bookings.push(newBooking);
        fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), err2 => {
            if (err2) return res.status(500).json({ error: 'Ghi file lỗi!' });
            res.json(newBooking);
        });
    });
});

// DELETE - xóa 1 booking theo id
app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Đọc file lỗi!' });
        let db = JSON.parse(data || '{"bookings":[]}');
        const oldLen = db.bookings.length;
        db.bookings = db.bookings.filter(b => String(b.id) !== bookingId);
        if (db.bookings.length === oldLen) return res.status(404).json({ error: 'Không tìm thấy booking!' });
        fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), err2 => {
            if (err2) return res.status(500).json({ error: 'Ghi file lỗi!' });
            res.json({ success: true });
        });
    });
});

// PUT - cập nhật 1 booking theo id
app.put('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    const updatedBooking = req.body;
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Đọc file lỗi!' });
        let db = JSON.parse(data || '{"bookings":[]}');
        let found = false;
        db.bookings = db.bookings.map(b => {
            if (String(b.id) === bookingId) {
                found = true;
                return { ...b, ...updatedBooking };
            }
            return b;
        });
        if (!found) return res.status(404).json({ error: 'Không tìm thấy booking!' });
        fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), err2 => {
            if (err2) return res.status(500).json({ error: 'Ghi file lỗi!' });
            res.json({ success: true });
        });
    });
});

app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));
