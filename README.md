PassHash
========

Google Chrome Extension that hashes a passphrase to generate 16-character, base64, (=1024-bit) password on the fly, using no storage or communication. Unlike [LastPass](http://www.lastpass.com), the users' passwords are *not* transmitted, stored centrally, nor stored locally. This is a hashing application that runs client side, in browser, with no login or account. That makes it more of a memory augmentation than a service.

[YouTube Promo](https://www.youtube.com/watch?v=4NxS-SU_6zw)  
[Product Page](http://www.pass-hash.com)  

## Installation

This is source for a Chrome Plugin. It can be downloaded for free from the [Chrome App Store](https://chrome.google.com/webstore/detail/passhash/obghkgeodnccgepekkbomhijojbodfmn). Alternatively, to build it yourself, follow these steps:  

1. Download all repository files in a single directory.  
2. Obtain copies of [jQuery](http://code.jquery.com/jquery-1.11.1.min.js) and QTip2 ([JS](http://cdn.jsdelivr.net/qtip2/2.2.1/jquery.qtip.min.js) + [CSS](http://cdn.jsdelivr.net/qtip2/2.2.1/jquery.qtip.min.css) ).  
3. In Chrome, go to Tools > Extensions and press "Load unpacked extension." Point it to the directory containing all the files.  
4. You should now see the logo in the upper right (#), and inserted into every password field on any page you load.  

## How to use

1. Download & Install.  
2. Log in to your favorite website and find the "change password" webform.  
3. (Known Bug) When the password fields appear, they may not have the (#) logo in them. Click on the logo in the upper right and they should appear.  
4. In the "old password" field, type in your current password.  
5. In the "new password" and "confirm password" fields, click on the (#) logo. Alternatively, click on or tab into the text field and press Alt+H. A window should appear.  
6. Enter a passphrase, preferably around 20 characters long. (For a guide to choosing strong passphrases, click [here](http://xkcd.com/936/) )  
7. As you type, random-looking letters, numbers, and symbols will appear in the window. This is the hash code corresponding to what you typed.  
8. After typing your passphrase, click on the hashcode below (or press enter). The hashed password will be inserted into the password field and the window will disappear.  
9. Once you have changed your password, log out, and log in with the new password by repeating steps 5-8.  

## How it works

The app is powered by the SHA256 algorithm, implemented in Javascript. Credit: Angel Marin, Paul Johnston. On each keyup event, the app hashes "site | passphrase", so for example, "facebook | hello world" hashes to "GzLIi/lxeLaI8hMx" while "google | hello world" hashes to "etsemL+7ZSwFtX82". Therefore, the same passphrase can be used for multiple sites.  

Because there is no account, user id, password, or permission associated with the app, users can opt to use the same passphrase for every site, different passphrases, as complex or as simple a passphrase as they choose.  

## FAQ

1. Is it portable between devices? This is a *Chrome* plugin intended for use on any device capable of running Chrome. That said, our beta testers are hard at work answering this question.  

2. What if I'm on somebody else's computer, at work, or on a computer that's not running Chrome? Go to the [Product Page](http://www.pass-hash.com) and enter "site | passphrase" exactly as it always appears in the plugin. When you click on the hash a popup will appear prompting you to copy it to your clibboard.  

3. Can this run on any other browser other than Chrome? We're working on a Firefox plugin next.  

4. What about Internet Explorer? I'm a professional developer. Don't talk to me about IE.  

5. What is a hash function? A hash function, otherwise known as a one-way, or trapdoor function, is an algorithm that takes a string of text as input and very quickly and easily converts it to a string of random-looking output text. Given the output text, however, the input text is nearly impossible to decode. It's random-looking, not *random*, because the same input text *always* returns the same output text.  

6. Why SHA256? The Secure Hashing Algorithm SHA256 is one of many, many cryptographic hash functions that hasn't been broken yet. (MD5 and SHA1 have.)  

7. Could somebody break SHA256 then? Yes. They will eventually. At which point we'll switch to another standard.  

8. How will I know when the hackers have broken it? Let's not split hairs here. It took decades to render MD5 and SHA1 obsolete. There is no sudden safe vs. broken transition point. It's just an industry trend: the longer it's been in use, the less secure it is.  

9. Why is this amazing tool free? [shrugs]