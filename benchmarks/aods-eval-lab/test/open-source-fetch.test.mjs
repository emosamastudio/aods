import test from "node:test";
import assert from "node:assert/strict";

import { sanitizeFetchedText } from "../src/fetch-open-source-corpora.mjs";

test("open-source fetch sanitizer redacts secret-like examples", () => {
  const slackToken = "xoxb-" + "1234567890-1234567890123-" + "5n38u5ed63fgzqlvuyxvxcx6";
  const privateKeyHeader = "-----BEGIN " + "OPENSSH PRIVATE KEY-----";
  const privateKeyFooter = "-----END " + "OPENSSH PRIVATE KEY-----";
  const source = [
    `token: ${slackToken}`,
    privateKeyHeader,
    "abc123",
    privateKeyFooter
  ].join("\n");

  const sanitized = sanitizeFetchedText(source);

  assert.equal(sanitized.replacementCount, 2);
  assert.match(sanitized.text, /<REDACTED-SLACK-TOKEN>/);
  assert.doesNotMatch(sanitized.text, /xoxb-1234567890/);
  assert.match(sanitized.text, /<REDACTED-OPENSSH-KEY-EXAMPLE>/);
  assert.doesNotMatch(sanitized.text, /BEGIN OPENSSH PRIVATE KEY/);
  assert.doesNotMatch(sanitized.text, /END OPENSSH PRIVATE KEY/);
});
