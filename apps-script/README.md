# Sending answers to Google Drive

The website sends each participant's answers to a small Google Apps Script. The script adds them to a spreadsheet called **Threshold of a Dream — Responses** inside your Drive folder.

## Set up (about 5 minutes, once)

1. Go to <https://script.google.com> and click **New project**. Name it "Threshold of a Dream".
2. Delete what's in `Code.gs`, then paste in everything from [Code.gs](Code.gs) in this folder. Save.
3. In the function menu at the top, choose **setup** and click **Run**. Google will ask for permission. Choose your account, then **Advanced → Go to Threshold of a Dream (unsafe) → Allow**. (It says "unsafe" only because you wrote the script yourself and Google hasn't reviewed it.) The spreadsheet now appears in your Drive folder.
4. Click **Deploy → New deployment**. Click the gear icon and choose **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Click **Deploy**, then copy the **Web app URL** (it ends in `/exec`).
6. In [docs/app.js](../docs/app.js), paste it between the quotes:
   ```js
   const SUBMIT_URL = "https://script.google.com/macros/s/…/exec";
   ```

## Also see answers in a Google Form (optional)

The script can also add every answer to a Google Form called **Threshold of a Dream — Interview**, so you can read them in the form's **Responses** tab (with charts for the multiple-choice questions). Each response there is one participant.

1. Paste the latest [Code.gs](Code.gs) into the Apps Script project and save.
2. In the function menu, choose **setupForm** and click **Run**. Allow the new Forms permission when Google asks. The form appears in your Drive folder, and its link is shown in the Execution log.
3. Redeploy as described below, so the web app starts using the new code.

Answers sent before this step stay only in the spreadsheet. If you add a transition to the website, add it to `TRANSITIONS` in Code.gs, then run **setupForm** again and redeploy; its questions are added at the end of the form.

## If you change Code.gs later

Use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. That keeps the same URL. Creating a *new* deployment gives a new URL, which you'd have to paste into `app.js` again.
