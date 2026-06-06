const VERIFICATION_HASH = process.env.C402INDEX_VERIFY_HASH || "f20798902826b01e4b89708bc6947288f1d3846960495a70b9d20d35537dced1";

exports.handler = async function handler() {
  return {
    statusCode: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=60"
    },
    body: `${VERIFICATION_HASH}\n`
  };
};
