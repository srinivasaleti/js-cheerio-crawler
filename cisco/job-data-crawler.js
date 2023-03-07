const puppeteer = require("puppeteer");
const { db } = require("../db");

const links = db.read("data/cisco/links.json");
const jobDataLocation = "data/cisco/jobs-data";

const main = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  for (const link of links) {
    const existingData = db.read(jobDataLocation);

    if (!(link in existingData)) {
      const result = await crawlSingleJob({
        browser,
        page,
        url: link,
      });
      db.writeUnique(jobDataLocation, link, result);
    }
  }

  console.log("Done");
  await page.close();
  await browser.close();
};

const crawlSingleJob = async ({ page, url }) => {
  await page.goto(url);
  await page.waitForNetworkIdle();
  console.log("starting crawling");

  const data = await page.evaluate(() => {
    try {
      //query elements
      const title = document.querySelector(".title_page-1").textContent;
      const location = document
        .querySelectorAll(".fields-data_wrapper .fields-data_item")?.[0]
        .querySelector(".fields-data_value")?.textContent;
      return {
        title,
        location,
      };
    } catch (e) {
      return {
        title: "",
        location: "",
      };
    }
  });

  return data;
};

main();
