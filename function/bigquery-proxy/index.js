const { BigQuery } = require("@google-cloud/bigquery");

const bigQuery = new BigQuery({
  projectId: process.env.projectId,
});

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.handler = async (req, res) => {
  // TODO check allowlisted IPs as a first-line defense
  console.log("Request IP is", req.ip);
  if (req.method !== "POST") {
    res.status(403).send({"status": "error"});
  } else {
    if (req.get("content-type") !== "application/json") {
      return res.status(403).send({"status": "invalid content-type, json is required."});
    }
    const options = req.body;
    const [job] = await bigQuery.createQueryJob(options);

    const [rows] = await job.getQueryResults();

    res.status(200).send(rows);
  }
};
