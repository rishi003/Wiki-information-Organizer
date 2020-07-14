// this is the starting point for the application.
const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const port = 3000;

async function getPage(pageName) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(pageName, { waitUntil: "networkidle0" });
  const data = await page.evaluate(() => {
    return document.querySelector("*").outerHTML;
  });
  return data;
}

app.use(express.static("public"));

app.get("/formData", (req, res) => {
  getPage(req.query.searchTerm).then((val) => {
    res.type("text/plain");
    res.send(val);
  });
});

app.listen(port, () => {
  console.log(`App is listening on http://localhost:${port}`);
});
