const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");
const {
    setupDatabase,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} = require("./database");

const app = express();
const port = 3000;

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Database - Start


    //Create the tasks table if it does not exist
    // db.prepare(`
    //     CREATE TABLE IF NOT EXISTS tasks (
    //         id INTEGER PRIMARY KEY AUTOINCREMENT,
    //         title TEXT NOT NULL,
    //         done INTEGER NOT NULL DEFAULT 0,
    //         created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //         updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    //     )
    // `).run();


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
app.get("/tasks", async (req, res) => {
    try {
        const rows = await getTasks(req.query.done);

        if (rows === null) {
            return res.status(400).json({
                error: "done must be true or false"
            });
        }

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database error"
        });
    }
});

// Return one task
app.get("/tasks/:id", async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        const task = await getTaskById(taskId);

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database error"
        });
    }
});

// Create a new task - Start
app.post("/tasks", async (req, res) => {
    try {
        const title = req.body.title;

        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({
                error: "Title is required and cannot be empty"
            });
        }

        const newTask = await createTask(title.trim());

        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
});
// Create a new task - End

// Update a task - Start
app.put("/tasks/:id", async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        const existingTask = await getTaskById(taskId);

        if (!existingTask) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const { title, done } = req.body;

        if (title === undefined && done === undefined) {
            return res.status(400).json({
                error: "Provide a title or done value"
            });
        }

        if (
            title !== undefined &&
            (typeof title !== "string" || title.trim() === "")
        ) {
            return res.status(400).json({
                error: "Title must be a non-empty string"
            });
        }

        if (done !== undefined && typeof done !== "boolean") {
            return res.status(400).json({
                error: "Done must be true or false"
            });
        }

        const updatedTitle =
            title !== undefined ? title.trim() : existingTask.title;

        const updatedDone =
            done !== undefined ? done : existingTask.done;

        const updatedTask = await updateTask(
            taskId,
            updatedTitle,
            updatedDone
        );

        res.json(updatedTask);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
});
// Update a task - End

// Delete a task - Start
app.delete("/tasks/:id", async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        const deletedRows = await deleteTask(taskId);

        if (deletedRows === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
});
// Delete a task - End

async function startServer() {
    try {
        await setupDatabase();

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

startServer();