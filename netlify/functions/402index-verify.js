const VERIFICATION_HASH = process.env.C402INDEX_VERIFY_HASH || "REPLACE_WITH_402INDEX_VERIFICATION_HASH";

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
