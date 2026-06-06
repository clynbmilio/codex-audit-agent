const PAY_TO = process.env.PAY_TO || "0xEbf30aEe899729b64aA3436D6b1dd45D063D1A12";
const USDC_ASSET = process.env.USDC_ASSET || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const BASE_URL = process.env.BASE_URL || "https://wewwwwww.netlify.app";

exports.handler = async function handler() {
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60"
    },
    body: JSON.stringify(
      {
        openapi: "3.1.0",
        info: {
          title: "README Security Quick Audit",
          version: "0.1.0",
          description: "A tiny x402-paid endpoint that returns a concise README/security trust audit."
        },
        servers: [{ url: BASE_URL }],
        paths: {
          "/audit": {
            post: {
              summary: "Run README/security trust audit",
              description: "Requires x402 payment unless demo mode is enabled.",
              operationId: "runReadmeSecurityQuickAudit",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/AuditRequest" }
                  }
                }
              },
              responses: {
                "200": { description: "Structured audit result" },
                "402": { description: "Payment required" }
              },
              x402: {
                scheme: "exact",
                price: "$0.05",
                network: "eip155:8453",
                asset: USDC_ASSET,
                payTo: PAY_TO
              }
            }
          }
        },
        components: {
          schemas: {
            AuditRequest: {
              type: "object",
              required: ["readme"],
              properties: {
                project_name: { type: "string" },
                url: { type: "string" },
                readme: { type: "string" },
                goal: { type: "string" }
              }
            }
          }
        }
      },
      null,
      2
    )
  };
};
