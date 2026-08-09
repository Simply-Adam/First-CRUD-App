const { Pool } = require("pg");

// Connect to Postgres using the URL from .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Create the table and starting tasks
async function setupDatabase() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            done BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const result = await pool.query(
        "SELECT COUNT(*) FROM tasks"
    );

    const taskCount = Number(result.rows[0].count);

    // Only seed tasks when the table is empty
    if (taskCount === 0) {

        await pool.query(
            "INSERT INTO tasks (title, done) VALUES ($1, $2)",
            ["Learn Express", true]
        );

        await pool.query(
            "INSERT INTO tasks (title, done) VALUES ($1, $2)",
            ["Build a CRUD API", false]
        );

        await pool.query(
            "INSERT INTO tasks (title, done) VALUES ($1, $2)",
            ["Learn GitHub", false]
        );
    }
}

module.exports = {
    pool,
    setupDatabase
};