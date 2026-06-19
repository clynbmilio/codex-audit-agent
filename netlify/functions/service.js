const PRICE_USDC = process.env.SERVICE_PRICE_USDC || "5.00";
const AMOUNT_ATOMIC = process.env.SERVICE_AMOUNT_ATOMIC || "5000000";
const PAY_TO = process.env.PAY_TO || "0xEbf30aEe899729b64aA3436D6b1dd45D063D1A12";
const USDC_ASSET = process.env.USDC_ASSET || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const FACILITATOR_URL = process.env.FACILITATOR_URL || "https://facilitator.payai.network";

function paymentRequired(resourceUrl) {
  return {
    x402Version: 2,
    error: "PAYMENT-SIGNATURE header is required",
    resource: {
      url: resourceUrl,
      description: "README Security Mini Audit",
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
        description: "README Security Mini Audit",
        mimeType: "application/json",
        maxTimeoutSeconds: 180,
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
  if (process.env.SERVICE_RESOURCE_URL) {
    return process.env.SERVICE_RESOURCE_URL;
  }

  const headers = Object.fromEntries(
    Object.entries(event.headers || {}).map(([key, value]) => [key.toLowerCase(), value])
  );
  const host = headers["x-forwarded-host"] || headers.host || "YOUR_PUBLIC_DOMAIN.example";
  const proto = headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}/service`;
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

function miniAudit(input) {
  const readme = String(input.readme || input.content || input.task || "");
  const projectName = String(input.project_name || input.name || "the project");
  const task = String(input.task || "Review README and trust signals.");
  const constraints = String(input.constraints || "Public, non-sensitive material only.");
  const lower = readme.toLowerCase();
  const findings = [];

  if (!/quickstart|getting started|install|setup/.test(lower)) {
    findings.push({
      priority: "P1",
      area: "Activation",
      issue: "A first-time user may not see a clear path from clone/open to a working result.",
      fix: "Add a 5-step quickstart with prerequisites, install command, config example, run command, and expected success output."
    });
  }

  if (/api[_-]?key|token|secret|password|private key|\.env/.test(lower) && !/\.env\.example|secret|credential|never commit|environment/.test(lower)) {
    findings.push({
      priority: "P1",
      area: "Credential safety",
      issue: "Credentials or environment variables are mentioned without enough safety framing.",
      fix: "Add a credentials section that links `.env.example`, names required variables, and warns against committing secrets."
    });
  }

  if (!/test|verify|lint|ci|npm test|pnpm test|pytest|go test|cargo test/.test(lower)) {
    findings.push({
      priority: "P2",
      area: "Verification",
      issue: "There is no obvious command a buyer, maintainer, or agent can run to verify the project works.",
      fix: "Document one verification command and the expected output or pass condition."
    });
  }

  if (!/license/.test(lower)) {
    findings.push({
      priority: "P2",
      area: "Reuse confidence",
      issue: "The README does not make reuse/license status obvious.",
      fix: "Add a license section and link the license file."
    });
  }

  if (!/security|responsible disclosure|report.*vulnerab|vulnerab/.test(lower)) {
    findings.push({
      priority: "P2",
      area: "Security contact",
      issue: "Security reporting expectations are not visible.",
      fix: "Add a short security/contact section for vulnerability reports or link `SECURITY.md`."
    });
  }

  if (findings.length === 0) {
    findings.push({
      priority: "P3",
      area: "Positioning",
      issue: "The basics are present; the biggest lift is making the value proposition more explicit in the first screen.",
      fix: "Rewrite the opening to state who it helps, what it does, and what trust boundary it does not cross."
    });
  }

  return {
    service: "README Security Mini Audit",
    price_usdc: PRICE_USDC,
    project_name: projectName,
    task,
    constraints,
    summary: `Reviewed ${projectName} for README clarity, setup trust, and security-facing signals.`,
    findings: findings.slice(0, 5),
    suggested_rewrite: {
      section: "README opening",
      markdown: `# ${projectName}\n\n${projectName} helps users understand, run, and verify the project with a setup path that is explicit about prerequisites, configuration, and trust boundaries.\n\nStart with the quickstart below, confirm the verification command passes, and review the security notes before using real credentials or production data.`
    },
    delivery_checklist: [
      "Add or tighten quickstart",
      "Document config/secrets safely",
      "Add verification command",
      "Clarify license/reuse",
      "Add security reporting note"
    ],
    limits: [
      "This is a first-pass AI-agent documentation/security-trust audit.",
      "It is not a formal penetration test, legal review, or compliance certification.",
      "It uses only buyer-provided or public non-sensitive input."
    ]
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
      body: JSON.stringify({ error: "Use POST with JSON body to run the $5 mini-audit." })
    };
  }

  const input = event.body ? JSON.parse(event.body) : {};
  if (!input.readme && !input.task && !input.content) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Missing required field: readme, content, or task" })
    };
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "PAYMENT-RESPONSE": demo ? "demo-mode-no-settlement" : b64Json(settlement.settle)
    },
    body: JSON.stringify(miniAudit(input), null, 2)
  };
};
