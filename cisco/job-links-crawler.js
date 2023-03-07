const puppeteer = require("puppeteer");
const { db } = require("../db");

const mainURL = "https://jobs.cisco.com/jobs";
const main = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(mainURL);
  await page.waitForNetworkIdle();
  await page.click(".submitButton");
  await page.waitForNetworkIdle();

  const result = (await queryAllJobs(page)).filter((l) => !!l);
  db.write("data/cisco/links.json", result, true);
  console.log("Done");
  await browser.close();
};

const queryAllJobs = async (page) => {
  const result = [];

  result.push(...(await queryAllJobLinksInAPage(page)));

  //Look for 10 pages for now replace for with while(true) for all the jobs
  for (i = 0; i < 10; i++) {
    const nextLink = await page.evaluate(() => {
      const link = Array.from(
        document
          .querySelector(".pagination")
          .querySelectorAll(".pagination_item")
      ).find((val) => val.textContent?.toLocaleLowerCase()?.includes("next"));

      return link?.href;
    });
    if (!nextLink) {
      break;
    }

    await page.goto(nextLink);
    result.push(...(await queryAllJobLinksInAPage(page)));
  }
  return result;
};

const queryAllJobLinksInAPage = async (page) => {
  await page.waitForNetworkIdle();

  const links = await page.evaluate(() => {
    const result = [];
    const jobs = document
      .querySelector("#table_overflow")
      .querySelectorAll("tr");
    for (const job of jobs) {
      result.push(
        job.querySelector('td[data-th="Job Title"]')?.querySelector("a")?.href
      );
    }
    return result;
  });
  return links;
};

main();
