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


// Get all tasks, optionally filtered by done status
async function getTasks(doneFilter) {
    if (doneFilter === undefined) {
        const result = await pool.query(
            "SELECT * FROM tasks ORDER BY id"
        );

        return result.rows;
    }

    if (doneFilter === "true") {
        const result = await pool.query(
            "SELECT * FROM tasks WHERE done = $1 ORDER BY id",
            [true]
        );

        return result.rows;
    }

    if (doneFilter === "false") {
        const result = await pool.query(
            "SELECT * FROM tasks WHERE done = $1 ORDER BY id",
            [false]
        );

        return result.rows;
    }

    return null;
}


// Get one task by id
async function getTaskById(id) {
    const result = await pool.query(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
    );

    return result.rows[0];
}

// Create a new task
async function createTask(title) {
    const result = await pool.query(
        `INSERT INTO tasks (title, done)
         VALUES ($1, $2)
         RETURNING *`,
        [title, false]
    );

    return result.rows[0];
}


// Update a task
async function updateTask(id, title, done) {
    const result = await pool.query(
        `UPDATE tasks
         SET title = $1,
             done = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [title, done, id]
    );

    return result.rows[0];
}


// Delete a task
async function deleteTask(id) {
    const result = await pool.query(
        "DELETE FROM tasks WHERE id = $1",
        [id]
    );

    return result.rowCount;
}

module.exports = {
    pool,
    setupDatabase,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};