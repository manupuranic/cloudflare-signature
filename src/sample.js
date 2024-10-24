import * as ed from "@noble/ed25519";
import { webcrypto } from "node:crypto";
if (!globalThis.crypto) globalThis.crypto = webcrypto;
import forge from "node-forge";
import blake2bwasm from "blake2b-wasm";
import blakejs from "blakejs";
import ondcCrypto from "ondc-crypto-sdk-nodejs";

async function main() {
  const privKey = ed.utils.randomPrivateKey(); // Secure random private key
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const pubKey = await ed.getPublicKeyAsync(privKey); // Sync methods below
  const signature = await ed.signAsync(message, privKey);
  const isValid = await ed.verifyAsync(signature, message, pubKey);
  console.log(isValid);
}

async function nobleAuthHeader(requestBody) {
  try {
    let requestBodyString = JSON.stringify(requestBody);
    let currentTimeUnix = Math.floor(Date.now() / 1000);
    let currentTimestamp =
      (requestBody && requestBody.created) || currentTimeUnix - 5 * 60;
    let expireTimestamp =
      (requestBody && requestBody.expires) || currentTimeUnix + 5 * 60;

    if (!blake2b.SUPPORTED) {
      console.log("WebAssembly not supported by your runtime");
    }

    let digestBase64;
    // var digestBuffer = blake2b. (requestBodyString);
    // digestBase64 = Buffer.from(digestBuffer).toString('base64');

    let signingString = `(created): ${currentTimestamp}
(expires): ${expireTimestamp}`;
  } catch (err) {
    console.log(err);
  }
}

async function blakewasmTest0(request) {
  let hash;
  request = JSON.stringify(request);
  await blake2b.ready(function (err) {
    if (err) throw err;
    hash = blake2b()
      .update(Buffer.from(request)) // pass in a buffer or uint8array
      .digest("base64");

    console.log("Blake2b hash by wasm is:", hash);
  });

  let digestBase64;
  var digestBuffer = blake.blake2b(request);
  digestBase64 = Buffer.from(digestBuffer).toString("base64");
  console.log("Blake2b hash by js is:", digestBase64);

  if (digestBase64 === hash) {
    console.log("Both hashes are same");
  } else {
    console.log("Both hashes are different");
  }
}

async function blakewasmTest(request) {
  let hashWasm;
  request = JSON.stringify(request);

  // Ensure blake2b-wasm is ready
  await blake2bwasm.ready();

  // Compute hash using blake2b-wasm
  const wasmHasher = blake2bwasm(64);
  wasmHasher.update(Buffer.from(request));
  hashWasm = wasmHasher.digest("base64");

  console.log("Blake2b hash by wasm is:", hashWasm);

  // Compute hash using blakejs
  const hashJs = blakejs.blake2b(Buffer.from(request)); // 64-byte output
  const digestBase64 = Buffer.from(hashJs).toString("base64");

  console.log("Blake2b hash by js is:", digestBase64);

  if (digestBase64 === hashWasm) {
    console.log("Both hashes are the same");
  } else {
    console.log("Both hashes are different");
  }
}
async function createAuthHeader(requestBody) {
  try {
    // Creating auth header https://docs.google.com/document/d/1Iw_x-6mtfoMh0KJwL4sqQYM0kD17MLxiMCUOZDBerBo/edit#

    let startTime = Date.now();
    let requestBodyString = JSON.stringify(requestBody);

    let digestBase64;
    var digestBuffer = blakejs.blake2b(requestBodyString);
    digestBase64 = Buffer.from(digestBuffer).toString("base64");

    console.log(`blakejs hash: ${digestBase64}`);

    let signingString = `digest: BLAKE-512=${digestBase64}`;

    let privateKey = "V72gCI173DsCYXVK87F+pXl3pz1jbs2MDknvTYDWnnk=";
    // let subscriberId = req.ondc.subscriberId;
    // let uniqueKeyId = req.ondc.bap_uniqueKeyId;

    let signature; //req.ondc.subscriberId == 'prd.mystore.in' || req.ondc.subscriberId == 'logistics.mystore.in') {
    var ed25519 = forge.pki.ed25519;
    signature = ed25519.sign({
      message: signingString,
      // also accepts `binary` if you want to pass a binary string
      encoding: "utf8",
      // node.js Buffer, Uint8Array, forge ByteBuffer, binary string
      privateKey: Buffer.from(privateKey, "base64"),
    });

    let signatureBase64 = Buffer.from(signature).toString("base64");
    return signatureBase64;
    // return `Signature keyId="${subscriberId}|${uniqueKeyId}|ed25519",algorithm="ed25519",created="${currentTimestamp}",expires="${expireTimestamp}",headers="(created) (expires) digest",signature="${signatureBase64}"`;
  } catch (err) {
    console.log(err);
  }
}

let request = {
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

async function cloudflareHeader(requestBody) {
  try {
    let requestBodyString = JSON.stringify(requestBody);

    // Ensure blake2b-wasm is ready
    await blake2bwasm.ready();

    // Compute hash using blake2b-wasm
    let digestBase64 = blake2bwasm(64);
    digestBase64.update(Buffer.from(requestBodyString));
    digestBase64 = digestBase64.digest("base64");

    console.log(`blake2b-wasm hash: ${digestBase64}`);

    let signingString = `digest: BLAKE-512=${digestBase64}`;

    let privKey = "V72gCI173DsCYXVK87F+pXl3pz1jbs2MDknvTYDWnnk=";
    // Convert the Base64 private key to Uint8Array (raw bytes)
    privKey = Buffer.from(privKey, "base64");

    if (privKey.length !== 32) {
      throw new Error("Private key must be 32 bytes long.");
    }
    // Convert the message to UTF-8 (align with forge)
    const message = new TextEncoder().encode(signingString);

    // Use Base64 private key directly, like in createAuthHeader
    const signature = await ed.signAsync(message, privKey);
    let signatureBase64 = Buffer.from(signature).toString("base64");
    return signatureBase64;
  } catch (error) {
    console.log(error);
  }
}

function validateSignature(request) {
  return new Promise(async (resolve, reject) => {
    if (request.data?.context && request.data?.message) {
      let isValid = await ondcCrypto.isHeaderValid({
        header: request.headers.Authorization, // The Authorisation header sent by other network participants
        body: request.data,
        publicKey: "/kc7NForff4F0A0W7cHO15HzhiOkoJ8K6IkPY598dZs=", //testing preprod key
      });
      if (!isValid) {
        console.log(
          `Header validation through ONDC-crypto failed, bap_id: ${request.data.context.bap_id}, bpp_id: ${request.data.context.bpp_id}`
        );
      } else {
        console.log("Header validation through ONDC-crypto passed");
      }
    }
    return resolve();
  });
}

let sampleRequest = {
  url: "http://mystore3.storehippo.manu:3000/ondc/1.0/on_cancel",
  method: "POST",
  headers: {
    Authorization:
      'Signature keyId="integrations-uat.storehippo.com|213|ed25519",algorithm="ed25519",created="1658404450",expires="1658405450",headers="(created) (expires) digest",signature="+TVTfI6SqTQK2Xb1TLAK1T1pZ3vPYvk8YYApEkkeGe1Cc7wUr4nK5Dp4fvLGPeB6wJdZ5urI8ExSQt7emPR9CQ=="',
    Accept: "application/json",
  },
  timeout: 180000,
  data: {},
};

async function main2() {
  try {
    let nodejs = await createAuthHeader(request);
    let cloudflare = await cloudflareHeader(request);
    console.log(nodejs);
    console.log(cloudflare);

    if (nodejs === cloudflare) {
      console.log("Both headers are same");
    } else {
      console.log("Both headers are different");
    }
  } catch (error) {
    console.log(error);
  }
}

async function validateCloudflareAuthHeader(requestBody) {
  try {
    let requestBodyString = JSON.stringify(requestBody);

    // Ensure blake2b-wasm is ready
    await blake2bwasm.ready();

    // Compute hash using blake2b-wasm
    let digestBase64 = blake2bwasm(64);
    digestBase64.update(Buffer.from(requestBodyString));
    digestBase64 = digestBase64.digest("base64");

    console.log(`blake2b-wasm hash: ${digestBase64}`);

    let currentTimeUnix = Math.floor(Date.now() / 1000);
    let currentTimestamp =
      (requestBody && requestBody.created) || currentTimeUnix - 5 * 60;
    let expireTimestamp =
      (requestBody && requestBody.expires) || currentTimeUnix + 5 * 60;

    let signingString = `(created): ${currentTimestamp}
(expires): ${expireTimestamp}
digest: BLAKE-512=${digestBase64}`;

    let subscriberId = "beta.mystore.in";
    let uniqueKeyId = "96c42708-b788-4410-bafe-3c82a282a1aa";

    let privKey = "V72gCI173DsCYXVK87F+pXl3pz1jbs2MDknvTYDWnnk=";
    // Convert the Base64 private key to Uint8Array (raw bytes)
    privKey = Buffer.from(privKey, "base64");

    if (privKey.length !== 32) {
      throw new Error("Private key must be 32 bytes long.");
    }
    // Convert the message to UTF-8 (align with forge)
    const message = new TextEncoder().encode(signingString);

    // Use Base64 private key directly, like in createAuthHeader
    const signature = await ed.signAsync(message, privKey);
    let signatureBase64 = Buffer.from(signature).toString("base64");

    let finalSign = `Signature keyId="${subscriberId}|${uniqueKeyId}|ed25519",algorithm="ed25519",created="${currentTimestamp}",expires="${expireTimestamp}",headers="(created) (expires) digest",signature="${signatureBase64}"`;

    sampleRequest.headers.Authorization = finalSign;
    console.log(sampleRequest.headers.Authorization);
    sampleRequest.data = requestBody;
    await validateSignature(sampleRequest);
  } catch (error) {
    console.log(error);
  }
}

async function validateNodejsAuthHeader(requestBody) {
  try {
    let requestBodyString = JSON.stringify(requestBody);

    // Ensure blake2b-wasm is ready
    await blake2bwasm.ready();

    // Compute hash using blake2b-wasm
    let digestBase64 = blake2bwasm(64);
    digestBase64.update(Buffer.from(requestBodyString));
    digestBase64 = digestBase64.digest("base64");

    console.log(`blake2b-wasm hash: ${digestBase64}`);

    let currentTimeUnix = Math.floor(Date.now() / 1000);
    let currentTimestamp =
      (requestBody && requestBody.created) || currentTimeUnix - 5 * 60;
    let expireTimestamp =
      (requestBody && requestBody.expires) || currentTimeUnix + 5 * 60;

    let signingString = `(created): ${currentTimestamp}
(expires): ${expireTimestamp}
digest: BLAKE-512=${digestBase64}`;

    let subscriberId = "beta.mystore.in";
    let uniqueKeyId = "96c42708-b788-4410-bafe-3c82a282a1aa";

    let privKey = "V72gCI173DsCYXVK87F+pXl3pz1jbs2MDknvTYDWnnk=";
    // Convert the Base64 private key to Uint8Array (raw bytes)
    privKey = Buffer.from(privKey, "base64");

    if (privKey.length !== 32) {
      throw new Error("Private key must be 32 bytes long.");
    }
    // Convert the message to UTF-8 (align with forge)
    const message = new TextEncoder().encode(signingString);

    // Use Base64 private key directly, like in createAuthHeader
    const signature = await ed.signAsync(message, privKey);
    let signatureBase64 = Buffer.from(signature).toString("base64");

    let finalSign = `Signature keyId="${subscriberId}|${uniqueKeyId}|ed25519",algorithm="ed25519",created="${currentTimestamp}",expires="${expireTimestamp}",headers="(created) (expires) digest",signature="${signatureBase64}"`;

    sampleRequest.headers.Authorization = finalSign;
    console.log(sampleRequest.headers.Authorization);
    sampleRequest.data = requestBody;
    await validateSignature(sampleRequest);
  } catch (error) {
    console.log(error);
  }
}

// main2();
// validateCloudflareAuthHeader(request);
// validateNodejsAuthHeader(request);

// blakewasmTest({ key: 'value' });
// main();
// blakewasmTest(request);
