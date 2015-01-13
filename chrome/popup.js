
/**
 * PassHash > popup.js
 * Written by Victor Davis Sep 2014
 * Contact VictorAlynDavis@gmail.com
 * 
 * This is the file that pops up when the user activates the extension to interact with it.
 */


var pass = {
  /**
   * Converts hexadecimal to base64
	 * Credit: http://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript
   */
  HexToBase64: function(string) {
		return btoa(string.match(/\w{2}/g).map(function(a){return String.fromCharCode(parseInt(a,16));}).join(""));
	},
	
  /**
   * The algorithm:
	 * (1) Append the site & phrase with a vertical bar, like "facebook | hello world"
	 * (2) Hash using SHA256 (separate downloaded file)
	 * (3) Convert hexed output to base64
	 * (4) Use only the first 16 characters (some websites set upper limits on length)
	 * Results in a 64x16= 1024-bit password
   */
  hash: function() {
		// get phrase & site
    var phrase = document.getElementById("hash_phrase").value;
    var site = document.getElementById("hash_site").value;
		var plaintext = site + phrase;
		
		// 1.2 don't do any work if the field is empty
		if (phrase.length > 0) {
			// show show/hide icon
			document.getElementById('showhide').style.display = 'inline';
		
			// 1.1 extra special security: encourage passphrase to be
			// longer than 10 characters
			phrase_len = phrase.length;
			bg = "";
			if (phrase_len < 10) {
				bg = "red";
			} else {
				bg = "black";
			}
			document.getElementById('hash_result').style.color = bg;
			
			// hash away
			var ciphertext = SHA256(plaintext);
			ciphertext = this.HexToBase64(ciphertext);
			ciphertext = ciphertext.substring(0,16);
			
			// display result
			document.getElementById('hash_result').innerHTML = ciphertext;
		} else {
			// hide show/hide icon, clear result
			document.getElementById('showhide').style.display = 'none';
			document.getElementById('hash_result').innerHTML = '';
		}
  },
  
	/**
	 * When user clicks on the result, send ciphertext down to the content script,
	 * and initialize all inputs
	 */
  insert: function(word) {
		var msg = { action: 'insert_text', pass: word };
		if (word.length > 0) {
			chrome.extension.sendMessage(msg, function(response){});
		}
	},

	/**
	* short utility functions
	*/
	toggle: function() {
		var type = document.getElementById('hash_phrase').type;
		
		var show = (type == 'password');
		var fieldtype = show ? 'text': 'password';
		var imgsrc    = show ? 'hide20.png': 'show20.png';
		var imgtitle  = show ? 'Hide': 'Show';
		
		document.getElementById('hash_phrase').type = fieldtype;
		document.getElementById('showhide').src = imgsrc;
		document.getElementById('showhide').title = imgtitle+' Passphrase Alt+S';
	},
	init: function(which) {
		this.toggle('hide');
		document.getElementById('hash_result').innerHTML = '';
		document.getElementById('hash_phrase').value = '';
		document.getElementById('showhide').style.display = 'none';
		
		if (which == 'visible') {
			document.addEventListener('keydown', pass.listen);
			document.getElementById('hash_phrase').focus();
		} else {
			// 1.2 remove listeners!
			document.removeEventListener('keydown', pass.listen);
		}
	},
	
	/*
	* key listener
	* 1.2 make sure to disable on qtip hide
	*/
	listen: function(e) {
		var key = e.keyCode;
		if (key == 13) { /* enter */
			var word = document.getElementById("hash_result").innerHTML;
			pass.insert(word);
		} else if (e.altKey & (key == 83)) { /* alt+s */
			pass.toggle();
		} else if (key == 27) { /* esc */
			// 1.2 tell content script to close qtip
			chrome.extension.sendMessage(
				{ action: 'close' },
				function(response){}
			);
		}
	}
};

/**
 * On load, add listeners
 * 
 */
document.addEventListener('DOMContentLoaded', function() {
	
	// refresh output at every keystroke, the algorithm is plenty fast, no need for a "submit" button
	var hash_click = document.getElementById('hash_phrase');
	hash_click.addEventListener('keyup', function() {
		pass.hash();
	});

	// make the result text clickable, click to insert, again, saving a button
	var hash_insert = document.getElementById('hash_insert');
	hash_insert.addEventListener('click', function() {
		var word = document.getElementById('hash_result').innerHTML;
		pass.insert(word);
	});
	
	// retrieve website / domain ("facebook"/"facebook.com") from local storage
	var hash_site = document.getElementById('hash_site');
	var hash_phrase = document.getElementById('hash_phrase');
	chrome.storage.sync.get(['site','domain','icon'], function (result) {
		//console.log(result);
		site = result.site;
		domain = result.domain;
		icon = result.icon;
		
		// populate inputs
		hash_site.value = site+' | ';
		hash_site.size = site.length;
		hash_phrase.size = 23 - site.length;
		
		// NONE OF THESE WORK RELIABLY
		// https://www.google.com/s2/favicons?domain=www.[] misses github
		// https://plus.google.com/_/favicon?domain=www.[] misses twitter
		// https://plus.google.com/_/favicon?domain=[] misses dropbox
		if (icon == "") {
			icon = "http://g.etfv.co/http://www."+domain;
		}
		hash_site.style.backgroundImage = "url('"+icon+"')";
		hash_site.style.backgroundRepeat = "no-repeat";
		hash_site.style.backgroundSize = "contain";
		hash_site.style.paddingLeft = "20px";
	});

	/**
	* Show/hide password toggle
	*/
	document.getElementById('showhide').addEventListener('click', function() {
		pass.toggle();
	});
	
	// autofocus passphrase
	pass.init();
});

/*
 * 1.1 If user enters, then exits, then enters qtip, refocus passphrase
 * (ondomloaded is catching this, but onshow can't reach inside the iframe
 *  to focus because of security restrictions -- use post message)
 */
window.addEventListener('message',function(e) {
	if (e.data.visible) { /* on qtip show */
		pass.init('visible');
	}
	if (e.data.hidden) { /* on qtip hide */
		pass.init('hidden');
	}
});