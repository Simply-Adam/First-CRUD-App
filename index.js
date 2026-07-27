const express = require("express");

const app = express();
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});