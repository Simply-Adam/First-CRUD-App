const express = require("express");

const app = express();
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});