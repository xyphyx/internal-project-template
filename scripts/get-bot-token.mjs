#!/usr/bin/env node
/**
 * Generates a short-lived GitHub App installation access token.
 *
 * Required env vars:
 *   XYPHYX_BOT_APP_ID           - GitHub App numeric ID
 *   XYPHYX_BOT_PRIVATE_KEY      - PEM-encoded private key (or path to .pem file)
 *   XYPHYX_BOT_INSTALLATION_ID  - Installation ID for xyphyx/internal-project-template
 *
 * Usage:
 *   GH_TOKEN=$(node scripts/get-bot-token.mjs)
 *   GH_TOKEN=$GH_TOKEN gh pr create ...
 */

import { createPrivateKey, createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { request } from "node:https";

const { XYPHYX_BOT_APP_ID, XYPHYX_BOT_PRIVATE_KEY, XYPHYX_BOT_INSTALLATION_ID } = process.env;

if (!XYPHYX_BOT_APP_ID || !XYPHYX_BOT_PRIVATE_KEY || !XYPHYX_BOT_INSTALLATION_ID) {
  process.stderr.write(
    "Error: XYPHYX_BOT_APP_ID, XYPHYX_BOT_PRIVATE_KEY, and XYPHYX_BOT_INSTALLATION_ID must be set.\n" +
      "See docs/github-app-setup.md for setup instructions.\n"
  );
  process.exit(1);
}

// Resolve private key: accept raw PEM or a path to a .pem file
let pemKey = XYPHYX_BOT_PRIVATE_KEY;
if (!pemKey.includes("BEGIN")) {
  // Treat as a file path
  pemKey = readFileSync(pemKey, "utf8");
}

/**
 * Encode a Buffer or string to URL-safe base64 (no padding).
 */
function base64url(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Create a GitHub App JWT valid for ~10 minutes.
 */
function createAppJwt(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iat: now - 60, // issued 60s ago to account for clock drift
      exp: now + 480, // 8 min from now = 9 min from iat, safely under GitHub's 10-min limit
      iss: String(appId),
    })
  );
  const signingInput = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = base64url(sign.sign(createPrivateKey(privateKeyPem)));
  return `${signingInput}.${signature}`;
}

/**
 * Exchange a GitHub App JWT for an installation access token.
 */
function getInstallationToken(jwt, installationId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path: `/app/installations/${installationId}/access_tokens`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "xyphyx-bot/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    };

    const req = request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode !== 201) {
          reject(new Error(`GitHub API error ${res.statusCode}: ${body}`));
          return;
        }
        const { token } = JSON.parse(body);
        resolve(token);
      });
    });

    req.on("error", reject);
    req.end();
  });
}

const jwt = createAppJwt(XYPHYX_BOT_APP_ID, pemKey);
const token = await getInstallationToken(jwt, XYPHYX_BOT_INSTALLATION_ID);
process.stdout.write(token);
