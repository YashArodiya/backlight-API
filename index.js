const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// MySQL database connection
const db = mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net',
    user: 'root',
    password: 'dBb61Cdag4CcaaHaBG43hdBDabcH1b6F',
    database: 'railway',
    port: '40238'
});

// Connect to MySQL
db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Database...');
});

// API to get the current week leaderboard
app.get('/leaderboard/current', (req, res) => {
    const query = `
        SELECT UID, Name, Score, Country
        FROM leaderboard
        WHERE YEARWEEK(TimeStamp, 1) = YEARWEEK(CURRENT_DATE, 1)
        ORDER BY Score DESC
        LIMIT 200
    `;
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// API to get the last week leaderboard for a given country
app.get('/leaderboard/lastweek', (req, res) => {
    const country = req.query.country;
    const query = `
        SELECT UID, Name, Score, Country
        FROM leaderboard
        WHERE Country = ?
        AND YEARWEEK(TimeStamp, 1) = YEARWEEK(CURRENT_DATE - INTERVAL 1 WEEK, 1)
        ORDER BY Score DESC
        LIMIT 200
    `;
    db.query(query, [country], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// API to fetch user rank
app.get('/user/rank', (req, res) => {
    const userId = req.query.userId;
    const query = `SELECT UserRank FROM (
        SELECT UID, Score, RANK() OVER (ORDER BY Score DESC) AS UserRank
        FROM leaderboard
    ) AS subquery 
    WHERE UID = ?
    `;
    db.query(query, [userId], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));