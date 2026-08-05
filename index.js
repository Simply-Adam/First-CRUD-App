const express = require("express");

const Database = require("better-sqlite3");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");

const app = express();
const port = 3000;

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Database - Start
    const db = new Database("tasks.db");


    //Create the tasks table if it does not exist
    db.prepare(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            done INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Check whether the table is empty
    const taskCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

    // Add the example tasks only on the first run
    if (taskCount.count === 0) {
        const insertTask = db.prepare(
            "INSERT INTO tasks (title, done) VALUES (?, ?)"
        );

        insertTask.run("Learn Express", 1);
        insertTask.run("Build a CRUD API", 0);
        insertTask.run("Learn GitHub", 0);
    }

//Database - End


// Information about the API
app.get("/", (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

// Check whether the server is running
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});


// Return all tasks or filter them by status
app.get("/tasks", (req, res) => {
    const doneFilter = req.query.done;
    let rows;

    // No filter: return every task
    if (doneFilter === undefined) {
        rows = db.prepare("SELECT * FROM tasks").all();
    }

    // Filter completed tasks
    else if (doneFilter === "true") {
        rows = db
            .prepare("SELECT * FROM tasks WHERE done = ?")
            .all(1);
    }

    // Filter unfinished tasks
    else if (doneFilter === "false") {
        rows = db
            .prepare("SELECT * FROM tasks WHERE done = ?")
            .all(0);
    }

    // Reject unsupported values
    else {
        return res.status(400).json({
            error: "done must be true or false"
        });
    }

    const tasks = rows.map((task) => ({
        id: task.id,
        title: task.title,
        done: Boolean(task.done),
        created_at: task.created_at,
        updated_at: task.updated_at
    }));

    res.json(tasks);
});


// Return one task from the database
app.get("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json({
        id: task.id,
        title: task.title,
        done: Boolean(task.done),
        created_at: task.created_at,
        updated_at: task.updated_at
    });
});


// Create a new task - Start
app.post("/tasks", (req, res) => {
    const title = req.body.title;

    // Make sure the title exists and is not empty
    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required and cannot be empty"
        });
    }

    const result = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run(title.trim(), 0);

    const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);

    res.status(201).json({
        id: newTask.id,
        title: newTask.title,
        done: Boolean(newTask.done),
        created_at: newTask.created_at,
        updated_at: newTask.updated_at
    });
});
// Create a new task - End

// Update a task - Start
app.put("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);

    // Find the existing task first
    const existingTask = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(taskId);

    if (!existingTask) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const { title, done } = req.body;

    // The body must contain title, done, or both
    if (title === undefined && done === undefined) {
        return res.status(400).json({
            error: "Provide a title or done value"
        });
    }

    // Validate title if it was provided
    if (
        title !== undefined &&
        (typeof title !== "string" || title.trim() === "")
    ) {
        return res.status(400).json({
            error: "Title must be a non-empty string"
        });
    }

    // Validate done if it was provided
    if (done !== undefined && typeof done !== "boolean") {
        return res.status(400).json({
            error: "Done must be true or false"
        });
    }

    // Keep the old value if a field was not provided
    const updatedTitle = title !== undefined ? title.trim() : existingTask.title;

    const updatedDone = done !== undefined ? Number(done) : existingTask.done;

    db.prepare(`
        UPDATE tasks
        SET title = ?, done = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(updatedTitle, updatedDone, taskId);

    const updatedTask = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(taskId);

    res.json({
        id: updatedTask.id,
        title: updatedTask.title,
        done: Boolean(updatedTask.done),
        created_at: updatedTask.created_at,
        updated_at: updatedTask.updated_at
    });
});
// Update a task - End

// Delete a task - Start
app.delete("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);

    const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.status(204).send();
});
// Delete a task - End

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});