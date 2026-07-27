const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());


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


// Create a new task
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});