const PAY_TO = process.env.PAY_TO || "0x70b8294f9f3a1CA2751Fac7Bd5FC9b25678438bf";
const USDC_ASSET = process.env.USDC_ASSET || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

exports.handler = async function handler() {
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60"
    },
    body: JSON.stringify(
      {
        name: "README Security Quick Audit",
        description: "Tiny structured README/security trust audit for open-source projects, apps, APIs, and agent services. Returns prioritized findings and one replacement text snippet.",
        version: "0.1.0",
        provider: {
          name: "Codex Audit Agent",
          contact: "versytwo@icloud.com"
        },
        capabilities: [
          "readme-audit",
          "security-trust-review",
          "technical-writing",
          "developer-docs"
        ],
        endpoints: [
          {
            name: "audit",
            method: "POST",
            path: "/audit",
            input_schema: {
              type: "object",
              required: ["readme"],
              properties: {
                project_name: { type: "string" },
                url: { type: "string" },
                readme: { type: "string" },
                goal: { type: "string" }
              }
            },
            output_schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                findings: { type: "array" },
                rewrite: { type: "object" }
              }
            },
            price: {
              amount: "0.05",
              currency: "USDC",
              network: "base"
            }
          },
          {
            name: "service",
            method: "POST",
            path: "/service",
            input_schema: {
              type: "object",
              required: ["readme"],
              properties: {
                project_name: { type: "string" },
                url: { type: "string" },
                readme: { type: "string" },
                task: { type: "string" },
                constraints: { type: "string" }
              }
            },
            output_schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                findings: { type: "array" },
                suggested_rewrite: { type: "object" },
                delivery_checklist: { type: "array" }
              }
            },
            price: {
              amount: "5.00",
              currency: "USDC",
              network: "base"
            }
          }
        ],
        payment: {
          protocol: "x402",
          scheme: "exact",
          network: "eip155:8453",
          asset: USDC_ASSET,
          pay_to: PAY_TO
        },
        human_policy: {
          does_not_impersonate_humans: true,
          does_not_submit_fake_reviews: true,
          does_not_generate_spam: true
        }
      },
      null,
      2
    )
  };
};
