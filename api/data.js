const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  // CORS allow
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({
      status: "error",
      message: "Number or CNIC required",
      developed_by: "NOBITA"
    });
  }

  const blockedNumbers = [
    "03305572940"
  ];

  if (blockedNumbers.includes(phone)) {
    return res.json({
      status: "error",
      message: "Tudum tedaw. Unauthorized number lookup detected. Please respect privacy.",
      developed_by: "NOBITA"
    });
  }

  try {
    // Server-side req to web
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
          Name: $(cols[1]).text().trim(),
          Mobile: $(cols[0]).text().trim(),
          Country: "Pakistan",
          CNIC: $(cols[2]).text().trim(),
          Address: $(cols[3]).text().trim()
        });
      }
    });

    // if data not available
    if (records.length === 0) {
      return res.json({
        status: "error",
        message: "No records found",
        developed_by: "NOBITA"
      });
    }

    // success response
    res.json({
      status: "success",
      message: "Data retrieved successfully",
      data: records,
      total_records: records.length,
      developed_by: "NOBITA"
    });

  } catch (error) {
    // error handle
    res.status(500).json({
      status: "error",
      message: "Server-side request failed",
      developed_by: "NOBITA"
    });
  }
};
