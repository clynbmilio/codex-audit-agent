const PRICE_USDC = process.env.PRICE_USDC || "0.05";
const AMOUNT_ATOMIC = process.env.AMOUNT_ATOMIC || "50000";
const PAY_TO = "0x70b8294f9f3a1CA2751Fac7Bd5FC9b25678438bf";
const USDC_ASSET = process.env.USDC_ASSET || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const FACILITATOR_URL = process.env.FACILITATOR_URL || "https://facilitator.payai.network";

function paymentRequired(resourceUrl) {
  return {
    x402Version: 2,
    error: "PAYMENT-SIGNATURE header is required",
    resource: {
      url: resourceUrl,
      description: "README Security Quick Audit",
      mimeType: "application/json"
    },
    accepts: [
      {
        scheme: "exact",
        network: "eip155:8453",
        asset: USDC_ASSET,
        payTo: PAY_TO,
        amount: AMOUNT_ATOMIC,
        maxAmountRequired: AMOUNT_ATOMIC,
        resource: resourceUrl,
        description: "README Security Quick Audit",
        mimeType: "application/json",
        maxTimeoutSeconds: 120,
        facilitator: FACILITATOR_URL,
        extra: {
          name: "USD Coin",
          version: "2"
        }
      }
    ],
    extensions: {}
  };
}

function b64Json(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

function fromB64Json(value) {
  return JSON.parse(Buffer.from(String(value), "base64").toString("utf8"));
}

function resourceUrlFromEvent(event) {
  if (process.env.RESOURCE_URL) {
    return process.env.RESOURCE_URL;
  }

  const headers = Object.fromEntries(
    Object.entries(event.headers || {}).map(([key, value]) => [key.toLowerCase(), value])
  );
  const host = headers["x-forwarded-host"] || headers.host || "YOUR_PUBLIC_DOMAIN.example";
  const proto = headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}/audit`;
}

async function callFacilitator(path, paymentPayload, paymentRequirements) {
  const response = await fetch(`${FACILITATOR_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      x402Version: 2,
      paymentPayload,
      paymentRequirements
    })
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(`facilitator ${path} failed with ${response.status}`);
    error.statusCode = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function settlePayment(headers, paymentRequirements) {
  const header =
    headers["payment-signature"] ||
    headers["x-payment"] ||
    headers["x-payment-payload"] ||
    headers["payment"];

  if (!header) {
    return null;
  }

  const paymentPayload = fromB64Json(header);
  const verify = await callFacilitator("/verify", paymentPayload, paymentRequirements);
  if (verify.isValid === false) {
    return { ok: false, statusCode: 402, verify };
  }

  const settle = await callFacilitator("/settle", paymentPayload, paymentRequirements);
  if (settle.success === false) {
    return { ok: false, statusCode: 402, verify, settle };
  }

  return { ok: true, verify, settle };
}

function auditReadme(input) {
  const readme = String(input.readme || "");
  const goal = String(input.goal || "Make the project easier to trust and try.");
  const lower = readme.toLowerCase();
  const findings = [];

  if (!/install|setup|getting started|quickstart/.test(lower)) {
    findings.push({
      priority: "P1",
      area: "First run",
      issue: "The README does not expose a clear install or quickstart path.",
      fix: "Add a short quickstart with prerequisites, install command, configuration, and expected success output."
    });
  }

  if (/api[_-]?key|token|secret|password|\.env/.test(lower) && !/security|secret|environment|env example|\.env\.example/.test(lower)) {
    findings.push({
      priority: "P1",
      area: "Secret handling",
      issue: "The README mentions credentials or environment variables without a visible safety note.",
      fix: "Add a short secrets section explaining which values must stay local, where `.env.example` lives, and what should never be committed."
    });
  }

  if (!/license/.test(lower)) {
    findings.push({
      priority: "P2",
      area: "Reuse confidence",
      issue: "The README does not mention the project license.",
      fix: "Add license information near the bottom and link to the license file."
    });
  }

  if (!/test|pytest|npm test|pnpm test|go test|cargo test/.test(lower)) {
    findings.push({
      priority: "P2",
      area: "Verification",
      issue: "No obvious test or verification command is documented.",
      fix: "Add one command users can run after setup to verify the project works."
    });
  }

  if (findings.length === 0) {
    findings.push({
      priority: "P3",
      area: "Positioning",
      issue: "The README covers the basics; the biggest opportunity is making the core trust promise sharper.",
      fix: "Move the main user promise, supported use cases, and safety boundary into the first screen."
    });
  }

  const projectName = input.project_name || "this project";
  return {
    summary: `Audit complete for ${projectName}. Goal used: ${goal}`,
    findings: findings.slice(0, 3),
    rewrite: {
      section: "README opening",
      text: `${projectName} helps users ${goal.toLowerCase()} with a setup path that is explicit about prerequisites, verification, and trust boundaries. Start with the quickstart below, then review the configuration notes before using it with real credentials or production data.`
    }
  };
}

exports.handler = async function handler(event) {
  const headers = Object.fromEntries(
    Object.entries(event.headers || {}).map(([key, value]) => [key.toLowerCase(), value])
  );
  const demo = headers["x-demo-mode"] === "true";
  const method = event.httpMethod || event.requestContext?.http?.method || "POST";
  const required = paymentRequired(resourceUrlFromEvent(event));

  let settlement = null;
  if (!demo) {
    try {
      settlement = await settlePayment(headers, required.accepts[0]);
    } catch (error) {
      return {
        statusCode: 402,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "PAYMENT-REQUIRED": b64Json(required)
        },
        body: JSON.stringify(
          {
            ...required,
            facilitator_error: {
              message: error.message,
              statusCode: error.statusCode || null,
              body: error.body || null
            }
          },
          null,
          2
        )
      };
    }
  }

  if (!demo && !settlement) {
    return {
      statusCode: 402,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "PAYMENT-REQUIRED": b64Json(required)
      },
      body: JSON.stringify(required, null, 2)
    };
  }

  if (!demo && settlement && !settlement.ok) {
    return {
      statusCode: settlement.statusCode || 402,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "PAYMENT-REQUIRED": b64Json(required)
      },
      body: JSON.stringify({ ...required, settlement }, null, 2)
    };
  }

  if (method === "GET") {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Use POST with JSON body to run the audit." })
    };
  }

  const input = event.body ? JSON.parse(event.body) : {};
  if (!input.readme) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Missing required field: readme" })
    };
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "PAYMENT-RESPONSE": demo ? "demo-mode-no-settlement" : b64Json(settlement.settle)
    },
    body: JSON.stringify(auditReadme(input), null, 2)
  };
};
