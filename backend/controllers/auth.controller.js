const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const LIST_API =
  'https://unstop.com/api/public/opportunity/search-result?opportunity=jobs&quickApply=true&oppstatus=open&page=1&per_page=50';

async function scrapeJobs() {
  try {
    console.log("⏳ Fetching job list from API...");

    const response = await axios.get(LIST_API, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const jobs = response.data?.data?.data || [];

    console.log(`✅ Found ${jobs.length} jobs\n`);

    const formattedJobs = jobs.map(job => ({
      Title: job.title || '',
      Company: job.organization?.name || '',
      Location: job.location || '',
      Stipend: job.stipend || '',
      Deadline: job.end_date || '',
      URL: "https://unstop.com/opportunity/" + job.slug
    }));

    const csvWriter = createCsvWriter({
      path: 'unstop_jobs.csv',
      header: [
        { id: 'Title', title: 'Title' },
        { id: 'Company', title: 'Company' },
        { id: 'Location', title: 'Location' },
        { id: 'Stipend', title: 'Stipend' },
        { id: 'Deadline', title: 'Deadline' },
        { id: 'URL', title: 'URL' }
      ]
    });

    await csvWriter.writeRecords(formattedJobs);

    console.log("📁 CSV File Saved: unstop_jobs.csv");

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

scrapeJobs();