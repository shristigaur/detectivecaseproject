# Sensitive Data Guard

Sensitive Data Guard is a local privacy tool with a Node/Express API, a React dashboard, and a Chrome Manifest V3 extension. Detection runs in the browser. The API receives only decision metadata: domain, category, decision, and timestamp.

## Run locally

1. Start MongoDB locally.
2. Copy `server/.env.example` to `server/.env` and set a private `JWT_SECRET`.
3. Start the API:

   ```bash
   cd server
   npm install
   npm run dev
   ```

4. Start the dashboard in a second terminal:

   ```bash
   cd client
   npm install
   npm run dev
   ```

5. Open the dashboard at `http://localhost:5173`, create an account, and configure policy rules.
6. In Chrome, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the `extension/` folder.
7. Open the extension popup and select **Sync policy** after logging in.

The extension is configured for Facebook, Twitter, and Gmail compose pages. It marks email addresses, phone numbers, and Luhn-valid card numbers while they are typed. It never sends the typed value to the server.

## Tests

```bash
cd server
npm test
```
# detectivecaseproject
