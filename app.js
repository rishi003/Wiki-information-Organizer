// this is the starting point for the application.
const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const { S_IFDIR } = require("constants");
const port = 3000;

async function getWikiPage(pageName) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  let data = {};
  await page.goto("https://en.wikipedia.org/wiki/" + pageName, {
    waitUntil: "networkidle0",
  });
  data.imgs = await page.$$eval("img", (imgs) =>
    imgs.map((img) => img.getAttribute("src"))
  );

  data.imgs = data.imgs.filter((img) => {
    return (
      !img.includes(".svg.png") &&
      !img.includes("/static/images") &&
      !img.includes("Red_Pencil_Icon.png") &&
      !img.includes("data:image")
    );
  });

  data.title = await page.$eval("h1", (heading) => heading.textContent);

  data.links = await page.$$eval("a", (as) => as.map((a) => a.href));
  data.links = data.links.filter((link) => {
    return (
      !link.includes("#cite") &&
      link != "" &&
      !link.includes("Good_articles") &&
      !link.includes("Protection") &&
      !link.includes("wikipedia.org")
    );
  });
  browser.close();
  return data;
}

async function getWikiLink(hrefAttr) {
  return "https://en.wikipedia.org/" + hrefAttr;
}

async function getTextContent(body) {
  return body;
}

async function getPage(pageName) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setRequestInterception(true);

  page.on("request", (req) => {
    if (req.resourceType() == "stylesheet" || req.resourceType() == "font") {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(pageName, { waitUntil: "networkidle0" });
  const data = await page.evaluate(() => {
    return document.querySelector("*").outerHTML;
  });
  return data;
}

app.use(express.static("public"));

app.get("/formData", (req, res) => {
  getWikiPage(req.query.searchTerm).then((val) => {
    res.send(val);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});