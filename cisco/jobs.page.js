const cheerio = require("cheerio");
const { fetchData } = require("../request");
const fs = require("fs");
async function fetchJobsInAPage(url) {
  const res = await fetchData(url);
  const html = res.data;
  const $ = cheerio.load(html);
  const rows = $(".table_basic-1>tbody>tr");

  let jobs = [];

  rows.each(function () {
    let title = $(this).find('td[data-th="Job Title"]');
    const url = title.find("a").attr("href");
    let areaOfInterest = $(this).find('td[data-th="Actions"]').text();
    let jobType = $(this).find('td[data-th="Area of Interest"]').text();
    let location = $(this).find('td[data-th="Location"]').text();
    let alternativeLocation = $(this)
      .find('td[data-th="Alternate Location"]')
      .text();

    jobs.push({
      title: title.text(),
      areaOfInterest,
      jobType,
      location,
      alternativeLocation,
      url,
    });
  });

  return jobs;
}

async function fetchAllJobs() {
  const jobs1 = await fetchJobsInAPage(
    "https://jobs.cisco.com/jobs/SearchJobs/developer"
  );
  const jobs2 = await fetchJobsInAPage(
    "https://jobs.cisco.com/jobs/SearchJobs/developer?projectOffset=25"
  );
  const jobs3 = await fetchJobsInAPage(
    "https://jobs.cisco.com/jobs/SearchJobs/developer?projectOffset=50"
  );
  const jobs4 = await fetchJobsInAPage(
    "https://jobs.cisco.com/jobs/SearchJobs/developer?projectOffset=75"
  );

  const allJobs = [...jobs1, ...jobs2, ...jobs3, ...jobs4];
  fs.writeFileSync("data/cisco/jobs.json", JSON.stringify(allJobs, null, 2));
}

fetchAllJobs();
