const axios = require("axios");

async function getHTML(url) {
  console.log(`Crawling data ${url}...`);
  // make http call to url
  let response = await axios(url).catch((err) => console.log(err));

  if (response.status !== 200) {
    console.log("Error occurred while fetching data");
    return;
  }
  return response;
}

module.exports.fetchData = getHTML;
