Change Log
==========

### Version 1.1
#### 2014-09-30

- Favicon services are unreliable. I'm scraping the DOM for rel="icon" and using favicon service as a fallback (ex: yahoo) {'contentscript.js','popup.js'}  

- Tapped the "on visible" qtip event to refocus the phrase field if the user exits, then enters again. Couldn't directly call iframe.element.focus() because of a security restriction. Did not want to circumvent the iframe, so I found the "post message" [solution](http://stackoverflow.com/questions/14014167/how-can-i-pass-mouse-events-from-parent-to-child-iframe). {'contentscript.js','popup.js'}  

- I don't want to *force* the user to use a 10 character passphrase, because it confuses the "refresh on key up" animation. What I did do was make the text red for < 10 chars, then black for >= 10 chars. {'popup.js'}  

- Added hints. Password field tooltip becomes "PassHash (#) Press [Alt]+H" on focus, blank on blur. Clickable hash string tooltip is now "Press [Enter] to Insert". {'contentscript.js','popup.html'}  

- Sweep() function does not catch fields that are either invisible at page load or are loaded dynamically (ajax, etc). Ex: Facebook. When I go to "settings" and "change password" *new* fields appear, necessitating sweep() to run again. Still can't figure out how to trigger an actual event that would work for *all* sites. Instead, I'm rerunning sweep() on every *mouse click*. This might prove unnecessary and expensive, but certainly it is not as bad as runing it once every few seconds or something. Now, when you click *any* button, but incidentally the "change password" button, sweep() runs again. It *will still fail* b/c ajax is retrieving the pass field html, and no telling exactly how long to set timeout before it loads. But user will always *click* inside the password field to proceed, and then the (#) logo will appear. This will cause confusion, but it saves a step having to click the upper right icon. {'contentscript.js'}  