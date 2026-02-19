const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeJob() {
  try {
    const url = "https://unstop.com/jobs/ivr-coder-pyxidiatech-lab-llp-1644721";

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);

    // Try extracting basic elements
    const title = $("h1").first().text().trim();
    const description = $("p").first().text().trim();

    console.log("Title:", title);
    console.log("Description:", description);

  } catch (error) {
    console.log("Error:", error.message);
  }
}

scrapeJob();
