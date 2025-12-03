import { google } from "googleapis";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.GMAIL_CLIENT_ID!;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;
const REDIRECT_URI = "https://developers.google.com/oauthplayground"; // or your exact redirect URI

const SCOPES = [
  "https://mail.google.com/",
  // or narrower: "https://www.googleapis.com/auth/gmail.send"
];

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

function getAccessCodeFromUser(authUrl: string): Promise<string> {
  console.log("\nAuthorize this app by visiting this URL:\n");
  console.log(authUrl);
  console.log("\nAfter approving, you’ll get a code. Paste it here and press Enter.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter the authorization code: ", (code) => {
      rl.close();
      resolve(code.trim());
    });
  });
}

async function main() {
  try {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
    });

    const code = await getAccessCodeFromUser(authUrl);

    const { tokens } = await oAuth2Client.getToken(code);
    console.log("\nTokens received:\n", tokens);

    if (!tokens.refresh_token) {
      console.error(
        "\nNo refresh_token returned. Make sure you used 'offline' access_type and 'consent' prompt."
      );
      process.exit(1);
    }

    console.log("\n==== Save this as GMAIL_REFRESH_TOKEN in your .env ====\n");
    console.log(tokens.refresh_token);
    console.log("\n======================================================\n");
  } catch (err) {
    console.error("Error while generating tokens:", err);
    process.exit(1);
  }
}

main();