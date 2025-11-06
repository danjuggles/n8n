// signer.js — core logic reused by CLI and server
const { chromium } = require("playwright");

function normalizeStartUrl(u) {
  if (!u) throw new Error("petitionUrl is required");
  const url = new URL(u);
  if (/\/signatures\/new\/?$/.test(url.pathname)) return url.toString();
  const m = url.pathname.match(/^\/petitions\/(\d+)/);
  if (m) return `${url.origin}/petitions/${m[1]}/signatures/new`;
  throw new Error("petitionUrl must look like https://petition.parliament.uk/petitions/<id>[/…]");
}

async function signPetition({
  petitionUrl,
  fullName,
  email,
  country = "GB",
  postcode = "",
  ukResident = true,
  notify = false,
}) {
  const START_URL = normalizeStartUrl(petitionUrl);

  // 👇 TEST MODE: short-circuit the real automation. Set in .env
  if (process.env.TEST_MODE === "true") {
    return {
      submitted: true,
      testMode: true,
      urlUsed: START_URL,
      phaseSeen: {
        initialSubmit: true,
        emailConfirmPage: false,
        finalInstructionPage: true,
      },
      snippet: "[TEST MODE] No browser automation was performed.",
    };
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(START_URL, { waitUntil: "domcontentloaded" });
    if (String(ukResident) === "true" || ukResident === true) await page.check("#signature_uk_citizenship");
    await page.fill("#signature_name", fullName);
    await page.fill("#signature_email", email);
    await page.selectOption("#signature_location_code", country);
    if (country === "GB") await page.fill("#signature_postcode", postcode);
    if (String(notify) === "true" || notify === true) await page.check("#signature_notify_by_email");

    await Promise.all([page.waitForLoadState("domcontentloaded"), page.click('button[name="move_next"]')]);

    const h1 = (await page.textContent("h1.page-title, h1.page-title-with-icon").catch(() => "")) || "";
    const onConfirmEmailPage = /make sure this is right/i.test(h1);
    if (onConfirmEmailPage) {
      await Promise.all([
        page.waitForLoadState("domcontentloaded"),
        page.click('form#new_signature button[name="button"]'),
      ]);
    }

    const final = (await page.textContent("main#content").catch(() => "")) || "";
    const success = /one more step/i.test(final) || /we[’']ve sent you an email/i.test(final);

    return {
      submitted: success,
      phaseSeen: {
        initialSubmit: true,
        emailConfirmPage: !!onConfirmEmailPage,
        finalInstructionPage: success,
      },
      urlUsed: START_URL,
      snippet: final.slice(0, 400),
    };
  } catch (e) {
    return { submitted: false, error: String(e) };
  } finally {
    await browser.close();
  }
}

module.exports = { signPetition, normalizeStartUrl };
