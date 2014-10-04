
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
	
	// get icon too (those favicon services just don't work
	icon = "";
	var link = document.getElementsByTagName("link");
	for (var i = 0; i < link.length; i++) {
		if ( (link[i].hasAttribute("rel"))
			&& (link[i].hasAttribute("href"))
			&& (link[i].rel.indexOf("icon") !== -1) ) {
			icon = link[i].href;
		}
	}
	
	//console.log('sending domain "'+site[0]+'" to background...');
	var info = { 'site': site[1], 'domain':site[0], 'icon':icon };
	chrome.storage.sync.set(
	  info,
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
	
	// 1.2 sweep() bumps focus off active element, restore manually
	var activeElem = document.activeElement;
	
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
				if (e.altKey & (e.keyCode == 72)) { /* alt+h */
					activePass = this;
					saveDomain();
					this.parentElement.getElementsByTagName("img")[0].click();
				}
			});
			
			// 1.1 give user hint about Alt+H
			passlist[i].addEventListener('focus', function() {
				this.parentElement.title = "PassHash (#) Press [Alt]+H";
			} );
			passlist[i].addEventListener('blur', function() {
				this.parentElement.title = "";
			} );
			
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
					/* 1.1 post message -- can't reach into iframe.element.focus() per security */
					visible : function() {
						$(iframe)[0].contentWindow.postMessage(
							{ "visible": true }, "*"
						);
					},
					hidden : function() {
						$(iframe)[0].contentWindow.postMessage(
							{ "hidden": true }, "*"
						);
						$(window.activePass).focus();
					}
				},
				style: {
					width: "400px",
					"max-width": "400px",
					"min-width": "400px",
				}
			});
		}
	}
	
	// 1.2 restore focus to active element
	activeElem.focus();
}

/**
 * Close tooltip if user clicks out of it, (self-collapsing window)
 */
document.body.onclick = function(e) {
	$('.passhash').qtip("hide");
}

/**
 * 1.2
 * Modified code from "typetype" plugin, inserts text into input one character at
 * a time using a recursive queued callback, which magically works for apple.com
 * 
 * https://github.com/iamdanfox/typetype
 */
$.fn.extend({
	typetype: function(txt, options) {
		var settings;
		
		settings = $.extend({
			callback: function() {}, /* runs after text insert */
			keypress: function() {}  /* runs after each keystroke */
		}, options);
		
		return this.each(function() {
			var elem;
			
			// this is necessary, can't just find/replace elem with "this"
			elem = this;
			
			return $(elem).queue(function() {
				var typeTo;
				
				typeTo = function(i) {
					
					if (i <= txt.length) {
						elem.value += txt[i - 1];
						settings.keypress.call(elem);
						
						setTimeout((function() {
							return typeTo(i + 1);
						}), 0);
						
					} else {
						settings.callback.call(elem);
						$(elem).dequeue();
					}
					
				};
				
				return typeTo(1);
			});
		});
	}
});

/**
 * Run sweep() function on DOM load
 * 1.1 Also on every mouse click, to catch the hidden fields
 */
$(document).ready(function() { sweep(); });
document.body.addEventListener('click',
	function() {
		sweep();
	}
);

/*
 * 1.2 Can't believe I have to do this, argh.
 * Some password fields have a "placeholder" attribute that disappears automatically
 * when user enters text (correct). Others have a "label for" whose visibility the site
 * controls via script (incorrect). Can't disappear "label for" automatically because
 * yet other sites use it (correctly) as an actual label. Disappear it *only* if it
 * physically overlaps the password field. TODO: find a way to fool the scripts
 * ex: disappear on apple & dropbox, leave on facebook & github & coursera
 */
function overlapping(a, b) {
	var ret = false;
	var aoff = a.offset();
	var boff = b.offset();
	
	// lefts match, tops match within +/- 5px
	if ( (aoff.left == boff.left)
		&& (aoff.top - boff.top < 5) 
		&& (boff.top - aoff.top < 5) ) {
		ret = true;
	}
	
	// run same test on children -- recursive
	if (b.children().length > 0) {
		ret = ret || overlapping(a, b.children(":first"));
	}
	
	return ret;
}

/**
 * Listens for "insert" command from popup, and inserts argument into active password field
 */
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	
	/**
	 * weird bug on ebay -- content script runs once per iframe on the page,
	 * so insert() sends once, but onMessage receives twice, only once with 
	 * access to window.activePass
	 */
	if (window.activePass == null) {
		console.log({'content script running in iframe, src = ': document.URL});
		return;
	}
	
	// sent from popup pass.insert()
  if (msg.action == 'insert_text') {
		/** 1.2 get rid of "label for" placeholder (apple, dropbox)
		 * CAREFUL! Some websites use "label for" the *right* way, as a *label*
		 * that says "Password:" not as a *placeholder* -- to distinguish,
		 * placeholder's offset().left is the same as the field itself
		 * ex: dropbox has <label>password
		 * ex: but apple has <label><span>password
		 * So check children's offset too! argh ><
		 */
		var label = document.getElementsByTagName("label");
		for (var i = 0; i < label.length; i++) {
			if ( (label[i].hasAttribute("for"))
				&& (label[i].attributes.for.value == activePass.id)
			  && ( overlapping($(window.activePass), $(label[i])) ) ) {
				label[i].remove();
			}
		}
		
		// disappear qtip after insert
		//$('.passhash').qtip("hide");
		$(activePass).focus();
		$(activePass).val('');
		
		/**
		 * 1,2 asynchronous call to modified typetype, yields neat effect
		 * of human typing, but more than that, this hodgepodge of calls
		 * actually fixes apple.com bug where validator doesn't trigger
		 */
		$(activePass).typetype(msg.pass, {
			callback: function() {
				// apple.com after inserting text, the password validator
				// does not get triggered until you do all this mess
				this.blur();
				this.focus();
				
				// make sure to hide qtip *last* -- its callback restores focus
				// to active password field
				$('.passhash').qtip("hide");
			}
		});
		
  } else if (msg.action == 'sweep') {
		sweep();
	} else if (msg.action == 'close') {
		$('.passhash').qtip("hide");
	}
});