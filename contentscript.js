
/**
 * PassHash > contentscript.js
 * Written by Victor Davis Sep 2014
 * Contact VictorAlynDavis@gmail.com
 * 
 * This file contains all the code necessary for modifying the DOM.
 * Some sensitive JS and CSS tricks must be employed to modify 
 * a major website's login screen without breaking it.
 */

/**
 * Global variable holding the DOM element into which the hashed password
 * will be inserted. Bad form. Change this later.
 */
activePass = null;

/*
 * extracts simple domain name, ignoring .com, .net, and subdomains www. etc
 * and sends it to background for inter-extension storage
 */
function saveDomain() {
	
	// ex facebook google homedepot, and write to background local storage
	var site = document.domain.toLowerCase().match("([a-z]*)\.[a-z]*$");
	
	//console.log('sending domain "'+site[0]+'" to background...');
	chrome.storage.sync.set(
	  { 'site': site[1], 'domain':site[0] },
	  function() {
		// Notify that we saved.
	});
}

/**
 * Runs on DOM load. Also runs when user clicks the icon in the upper right.
 * Scans the page for password input fields and iconifies each by inserting 
 * PassHash icon (#) in the far right. Clicking on the icon opens the popup,
 * implemented as a qtip: http://qtip2.com/
 * 
 * NOTE: QTip has a jQuery dependency, so it is this feature that requires
 * us to load jQuery library
 */
function sweep() {
	
	// scan all inputs for type="password" attribute
	var inputs = document.getElementsByTagName("input");
	var i, passlist = [];
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i].type == "password") {
			passlist.push(inputs[i]);
		}
	}

	// for each result, iconify the field
	for (i = 0; i < passlist.length; i++) {
		
		// if this field has not *already* been passhashed
		var zero = passlist[i].parentElement.getElementsByClassName("passhash").length;
		
		// paypal loads password fields in the background, then displays them.
		// passhash should not mess with them unless they are visible
		var paypal = (passlist[i].offsetHeight > 0);
		
		// two prereqs: that the field is not *already* iconified and the field is visible
		if ((zero == 0) & paypal) {
		
			// create wrapper in which to insert input + image
			reladiv = document.createElement("div");
			reladiv.className = "reladiv";
			reladiv.style.position = "relative";
			reladiv.style.height = passlist[i].offsetHeight;
			reladiv.style.margin = '0px';
			reladiv.style.padding = '0px';
			
			// create clickable image to far right of field
			img = document.createElement("img");
			img.src = chrome.extension.getURL("icon128.png");
			img.className = "passhash";
			img.height = passlist[i].offsetHeight;
			img.style.height = passlist[i].offsetHeight+'px';
			img.style.position = "absolute";
			img.style.top = "0px";
			img.style.zIndex = 3;
			
			// appendChild will reorder your node to the end of its list of sisters, must use replaceChild
			myparent = passlist[i].parentElement;
			myparent.replaceChild(reladiv, passlist[i]);
			
			// insert password field + image into new parent div
			reladiv.appendChild(passlist[i]);
			reladiv.appendChild(img);
			
			// accurately set the positioning
			img.style.left = (passlist[i].offsetWidth + passlist[i].offsetLeft - passlist[i].offsetHeight)+"px";
			img.style.top = (passlist[i].offsetTop)+"px";
			
			// use Alt+H to open qtip
			passlist[i].addEventListener('keyup', function(e) {
				if (e.altKey & (e.keyCode == 72)) {
					activePass = this;
					saveDomain();
					this.parentElement.getElementsByTagName("img")[0].click();
				}
			});
			
			// not a link! create click function for icon
			// When icon is clicked, write the website name to local storage,
			// NOTE: user may have multiple tabs open and they all share the extension,
			// so by clicking on an icon, the user is changing the domain
			img.onclick = function() {
				
				// register active password field as global variable (BAD FORM)
				activePass = this.parentElement.getElementsByTagName("input")[0];
				//console.log(activePass);
				
				// save domain name to background
				saveDomain();
			}
			
			// create content for the popup
			iframe = document.createElement("iframe");
			iframe.id = "ifpopup";
			iframe.src = chrome.extension.getURL("popup.html");
			iframe.height = "42px";
			iframe.width = "100%";
			iframe.style.borderWidth = "0";
			
			// qtip2.com allows for tooltips with html content, requires jQuery
			$('.passhash').qtip( 
			{
				content: $(iframe),
				position: {
					at: "bottom right",
					my: "top right"
				},
				show: {
					event: 'click' /* do not show tooltip on mouse over, wait for click */
				},
				hide: {
					event: 'nonexisting' /* wait for programmatic close */
				},
				events: {
					visible : function() { /* focus on input? */ }
				},
				style: {
					width: "400px",
					"max-width": "400px",
					"min-width": "400px",
				}
			});
		}
	}
}

/**
 * Close tooltip if user clicks out of it, (self-collapsing window)
 */
document.body.onclick = function(e) {
	$('.passhash').qtip("hide");
}

/**
 * Run sweep() function on DOM load
 */
$(document).ready(function() { sweep(); });

/**
 * Listens for "insert" command from popup, and inserts argument into active password field
 */
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'insert_text') {
		activePass.value = msg.pass;
		
		// disappear qtip after insert
		$('.passhash').qtip("hide");
		activePass.focus();
		
  } else if (msg.action == 'sweep') {
		sweep();
	}
});