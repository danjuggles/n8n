// server.js — HTTP API for n8n
const express = require("express");
const bodyParser = require("body-parser");
const { signPetition } = require("./signer");

const app = express();
app.use(bodyParser.json());

app.post("/sign", async (req, res) => {
  try {
    const {
      petitionUrl,
      fullName,
      email,
      country = "GB",
      postcode = "",
      ukResident = true,
      notify = false,
    } = req.body || {};

    if (!petitionUrl || !fullName || !email) {
      return res.status(400).json({
        submitted: false,
        error: "petitionUrl, fullName, and email are required",
      });
    }

    const result = await signPetition({
      petitionUrl,
      fullName,
      email,
      country,
      postcode,
      ukResident,
      notify,
    });

    // Always JSON
    const status = result.submitted ? 200 : 422;
    return res.status(status).json(result);
  } catch (e) {
    return res.status(500).json({ submitted: false, error: String(e) });
  }
});

app.get("/healthz", (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`signer listening on :${port}`);
});
