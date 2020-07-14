// this is the starting point for the application.
const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/formData", (req, res) => {
  console.log(req.query.searchTerm);
});

app.listen(port, () => {
  console.log(`App is listening on http://localhost:${port}`);
});
