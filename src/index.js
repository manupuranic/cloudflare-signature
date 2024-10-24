/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
let ed = require("@noble/ed25519");
import { blake2b } from "@noble/hashes/blake2b";

let sampleRequest = {
  context: {
    domain: "ONDC:RET12",
    country: "IND",
    city: "std:080",
    core_version: "1.2.0",
    action: "update",
    bap_id: "beta.mystore.in",
    bap_uri: "https://beta.mystore.in/ondc/1.0/",
    bpp_id: "beta.mystore.in",
    bpp_uri: "https://beta.mystore.in/ondc/1.0",
    transaction_id: "925d209c-7398-4dc1-93fb-4fed4e1522e5",
    message_id: "dd35d328-fab1-43e0-ad26-d0bf94f164e3",
    timestamp: "2024-07-31T08:43:28.000Z",
    ttl: "PT30S",
  },
  message: {
    update_target: "item",
    order: {
      id: "66a0ddf390156600245d6c35",
      fulfillments: [
        {
          type: "Return",
          tags: [
            {
              code: "return_request",
              list: [
                {
                  code: "id",
                  value: "66a9f92fddbe52111461c97d-66a0ddae90156600245d68be",
                },
                {
                  code: "item_id",
                },
                {
                  code: "item_quantity",
                  value: 1,
                },
                {
                  code: "reason_id",
                  value: "002",
                },
                {
                  code: "reason_desc",
                  value: "test100",
                },
                {
                  code: "images",
                  value:
                    "https://preprod.mystore.in/s/632dcf060c84820019e5c3eb/66a9f90eddbe52111461c973/screenshot-2024-07-31-at-12-07-41pm.png",
                },
                {
                  code: "ttl_approval",
                  value: "PT24H",
                },
                {
                  code: "ttl_reverseqc",
                  value: "P3D",
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

function uint8ArrayToBase64(u8a) {
  const binaryString = Array.from(u8a)
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return btoa(binaryString);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    console.log(queryParams);

    // Check if there are any query parameters
    let requestBody;
    let queryPresent = 1;
    if (queryParams.key) {
      requestBody = queryParams.key;
    } else {
      queryPresent = 0;
      requestBody = sampleRequest;
    }

    const data = new TextEncoder().encode(requestBody);

    const hash = blake2b(data, { dkLen: 64 });

    const noblehash = uint8ArrayToBase64(hash);

    console.log("Blake2b hash by nobles is:", noblehash);

    let signingString = `digest: BLAKE-512=${noblehash}`;

    let privKey = "ip5u2rhmLSBGLvTIjJCh2MnhguL8Sqc0saxYs113dRw=";
    // Convert the Base64 private key to Uint8Array (raw bytes)
    privKey = Uint8Array.from(atob(privKey), (c) => c.charCodeAt(0));

    if (privKey.length !== 32) {
      throw new Error("Private key must be 32 bytes long.");
    }
    // Convert the message to UTF-8 (align with forge)
    const message = new TextEncoder().encode(signingString);

    // Use Base64 private key directly, like in createAuthHeader
    const signature = await ed.signAsync(message, privKey);
    let signatureBase64 = uint8ArrayToBase64(signature);

    let result = {
      blake2b_hash: noblehash,
      ed25519_signature: signatureBase64,
    };

    if (queryPresent) {
      result.query_passed = requestBody;
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  },
};
