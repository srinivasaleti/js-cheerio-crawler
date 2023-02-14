const cheerio = require("cheerio");
const { fetchData } = require("../request");
const { db } = require("../db");

const successDataPath = "data/cisco/job-data.json";
const failedJobsPath = "data/cisco/failed-job-data.json";
const dataPath = "data/cisco/jobs.json";

async function fetchSingleJob(url) {
  const res = await fetchData(url);
  const html = res.data;
  const $ = cheerio.load(html);
  let jobProps = $(".cleanList>.fields-data_item");

  const job = {};
  jobProps.each(function () {
    const label = $(this).find(".fields-data_label").text();
    const value = $(this).find(".fields-data_value").text();
    job[label] = value;
  });

  return job;
}

async function crawlAllJobs(path) {
  const data = db.read(path);

  for (const job of data) {
    try {
      const jobData = await fetchSingleJob(job.url);
      db.write(successDataPath, jobData);
    } catch (e) {
      db.write(failedJobsPath, job);
    }
  }
}

crawlAllJobs(dataPath);
