const PRICE_USDC = process.env.PRICE_USDC || "0.05";
const PAY_TO = process.env.PAY_TO || "0xEbf30aEe899729b64aA3436D6b1dd45D063D1A12";
const USDC_ASSET = process.env.USDC_ASSET || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

exports.handler = async function handler() {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(
      {
        ok: true,
        service: "README Security Quick Audit",
        price_usdc: PRICE_USDC,
        network: "base",
        asset: USDC_ASSET,
        pay_to: PAY_TO
      },
      null,
      2
    )
  };
};
