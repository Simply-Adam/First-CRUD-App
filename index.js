const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");

const app = express();
const port = 3000;

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Temporary in-memory task list
const tasks = [
    {
        id: 1,
        title: "Morning shower",
        done: true
    },
    {
        id: 2,
        title: "Workout",
        done: false
    },
    {
        id: 3,
        title: "Have lunch",
        done: false
    }
];

let nextId = 4;

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

// Return all tasks
app.get("/tasks", (req, res) => {
    res.json(tasks);
});

// Return one task using its ID
app.get("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);

    const task = tasks.find((task) => task.id === taskId);

    if (!task) {
        return res.status(404).json({
            error: `Task ${taskId} not found`
        });
    }

    res.json(task);
});


// Create a new task - Start
app.post("/tasks", (req, res) => {
    const title = req.body.title;

    // Make sure the title is not empty
    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required and cannot be empty"
        });
    }

    const newTask = {
        id: nextId,
        title: title.trim(),
        done: false
    };

    nextId++;
    tasks.push(newTask);

    res.status(201).json(newTask);
});
// Create a new task - End

// Update a task - Start
app.put("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);
    const task = tasks.find((task) => task.id === taskId);

    if (!task) {
        return res.status(404).json({
            error: `Task ${taskId} not found`
        });
    }

    const { title, done } = req.body;

    // The body must contain title, done, or both
    if (title === undefined && done === undefined) {
        return res.status(400).json({
            error: "Provide a title or done value"
        });
    }

    // Validate title when it is provided
    if (
        title !== undefined &&
        (typeof title !== "string" || title.trim() === "")
    ) {
        return res.status(400).json({
            error: "Title must be a non-empty string"
        });
    }

    // Validate done when it is provided
    if (done !== undefined && typeof done !== "boolean") {
        return res.status(400).json({
            error: "Done must be true or false"
        });
    }

    if (title !== undefined) {
        task.title = title.trim();
    }

    if (done !== undefined) {
        task.done = done;
    }

    res.json(task);
});
// Update a task - End

// Delete a task - Start
app.delete("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);

    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: `Task ${taskId} not found`
        });
    }

    tasks.splice(taskIndex, 1);

    res.status(204).send();
});
// Delete a task - End

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});