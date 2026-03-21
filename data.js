  // bhai baat suno ye koi real API nahi hai ye dusri web se apke liye data scrap karegi thik h na bhai
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  // CORS headers for browser
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Number or CNIC required",
      developer: "NOBITA"
    });
  }

  try {
    // Sever-side request to FreshSimDatabases
    const response = await axios.post(
      "https://freshsimdatabases.com/numberDetails.php",
      `numberCnic=${phone}&searchNumber=`,
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "referer": "https://freshsimdatabases.com/",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        timeout: 10000
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);

    const records = [];
    $("table tr").each((i, row) => {
      const cols = $(row).find("td");
      if (cols.length >= 4) {
        records.push({
          Mobile: $(cols[0]).text().trim(),
          Name: $(cols[1]).text().trim(),
          CNIC: $(cols[2]).text().trim(),
          Address: $(cols[3]).text().trim()
        });
      }
    });

    if (records.length === 0) {
      return res.json({
        success: false,
        message: "No records found",
        developer: "NOBITA"
      });
    }

    res.json({
      success: true,
      records: records,
      developer: "NOBITA"
  // bhai agar apna whatsapp number add krna ho to jahan b developer: "NOBITA" likha hai oske ek comma laga kr neche e.g whatsapp: "number" likh dena bas 
    });
  }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server-side request failed. Possibly site blocked direct browser access.",
      developer: "NOBITA"
    });
  }
};