// sign.js — CLI wrapper: node sign.js "<url>" "Full Name" "email" "GB" "SW1A 0AA" true false false
const { signPetition } = require("./signer");

(async () => {
  const [, , petitionUrl, fullName, email, country = "GB", postcode = "", ukResident = "true", notify = "false", testMode = "false"] =
    process.argv;

  try {
    const result = await signPetition({
      petitionUrl,
      fullName,
      email,
      country,
      postcode,
      ukResident,
      notify,
      testMode,
    });
    // stdout must be pure JSON for n8n
    process.stdout.write(JSON.stringify(result));
    process.exit(result.submitted ? 0 : 1);
  } catch (e) {
    process.stdout.write(JSON.stringify({ submitted: false, error: String(e) }));
    process.exit(1);
  }
})();
