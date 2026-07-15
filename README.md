# SipTap NFC Hydration App

Includes two configurable bottles, animated fill, daily progress, history, undo/reset, 7-day stats, and offline support.

## Deploy
Upload all files to a static host such as GitHub Pages.

1. Create a repository called `siptap`.
2. Upload these files to the repository root.
3. Open Settings → Pages.
4. Choose Deploy from a branch.
5. Select `main` and `/ (root)`.
6. Open the published URL in Safari.

## Install on iPhone
Safari → Share → Add to Home Screen → Add.

## Configure
Open the app → gear icon → set daily goal and both bottle volumes.

## NFC: beginner setup
For each tag:
1. Shortcuts → Automation → + → NFC.
2. Scan and name the tag.
3. Add `Open URLs`.
4. Use the direct logging URL for that bottle from the next section.
5. Turn off "Ask Before Running" if Shortcuts offers that option.

## NFC: direct logging
The app accepts:
`https://YOUR-SITE/?log=home&run=UNIQUE_VALUE`
`https://YOUR-SITE/?log=travel&run=UNIQUE_VALUE`

In Shortcuts, use Current Date → Format Date → Text containing the URL with the formatted date as `run` → Open URLs. This ensures each NFC tap creates a fresh log.

Use the `home` URL for the first bottle and the `travel` URL for the second bottle. The names and volumes can be changed inside SipTap settings without changing the NFC tag URLs.

## Privacy
Data remains in local browser storage on that phone. Clearing Safari website data can erase it. No cloud sync or account is included.
