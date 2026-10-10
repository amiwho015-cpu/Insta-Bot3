## **STEP INSTALL GOAT BOT IG**
> Goat-Bot-IG is forked from **NTKhang**'s Messenger bot
> [Goat-Bot-V2](https://github.com/ntkhang03/Goat-Bot-V2); the Instagram edition
> is by **lazyneoaz (Saifullah Al Neoaz)** — https://github.com/lazyneoaz.
> This guide covers installing it on mobile (Android, iOS) and PC
> (Windows, macOS, Linux) with replit.com.

---
<h1 align="center"><b>STEP BY STEP GUIDE</b></h1>

* Download kiwi browser from play store. Open kiwi browser and go to https://replit.com
```
https://replit.com
```
* Create a new team education, then create a new project with `bash` language, then open console and type:
```bash
git clone <this repo> Goat-Bot-IG && cp -r Goat-Bot-IG/. . && rm -rf Goat-Bot-IG
```
* Then type:
```bash
npm install
```
* Download the `Cookie Editor` extension from the Chrome web store, go to https://www.instagram.com, open the extension and click `Export` -> `Export as JSON`
* Then back to replit, open `account.txt` and paste your Instagram cookies there (see the main README for the accepted formats)
---
* Go to https://console.cloud.google.com/ to create a new project (don't forget to **`public`** your project) and add Authorized redirect URIs: `https://developers.google.com/oauthplayground` (without backslash at the end), then go to https://developers.google.com/oauthplayground to create a new OAuth 2.0 Client ID with permission: `https://www.googleapis.com/auth/drive` and `https://mail.google.com` then copy your `Refresh token` `Client ID` and `Client Secret` to `config.json` in part `credentials` -> `google`
```
https://console.cloud.google.com/
```
```
https://developers.google.com/oauthplayground
```
* Go to https://www.google.com/recaptcha/admin/create to create a new reCAPTCHA v2 with `I'm not a robot checkbox`
* Add domain **`repl.co`** (not repl.com) to your reCAPTCHA v2 
* Accept the reCAPTCHA v2 terms of service 
* Then copy your `Site key` and `Secret key` to `config.json`
```
https://www.google.com/recaptcha/admin/create
```
* Go to https://betterstack.com/better-uptime or https://uptimerobot.com/ to create a new monitor for your project
```
https://betterstack.com/better-uptime
```

