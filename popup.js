
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
		
		// 1.1 extra special security: encourage passphrase to be longer than 10 characters
		phrase_len = phrase.length;
		bg = "";
		if (phrase_len < 10) {
			bg = "red";
		} else {
			bg = "black";
		}
		document.getElementById("hash_result").style.color = bg;
		
		// hash away
		var ciphertext = SHA256(plaintext);
		ciphertext = this.HexToBase64(ciphertext);
		ciphertext = ciphertext.substring(0,16);
		
		// display result
		document.getElementById("hash_result").innerHTML = ciphertext;
  },
  
	/**
	 * When user clicks on the result, send ciphertext down to the content script,
	 * and initialize all inputs
	 */
  insert: function(word) {
		//console.log('sending password "'+word+'" to background...');
		chrome.extension.sendMessage({pass:word}, function(response){
			//console.log('received: '+response.confirmation);
			
			// clear inputs
			document.getElementById("hash_phrase").value = "";
			document.getElementById("hash_result").innerHTML = "";
		});
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
		var word = document.getElementById("hash_result").innerHTML;
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
		hash_phrase.size = 24 - site.length;
		
		// NONE OF THESE WORK RELIABLY
		// https://www.google.com/s2/favicons?domain=www.[] misses github
		// https://plus.google.com/_/favicon?domain=www.[] misses twitter
		// https://plus.google.com/_/favicon?domain=[] misses dropbox
		var iconsrc = icon;
		if (iconsrc == "") {
			iconsrc = "http://g.etfv.co/http://www."+domain;
		}
		hash_site.style.backgroundImage = "url('"+iconsrc+"')";
		hash_site.style.backgroundRepeat = "no-repeat";
		hash_site.style.backgroundSize = "contain";
		hash_site.style.paddingLeft = "20px";
	});
	
	document.getElementById("hash_phrase").focus();
});

/*
 * insert on enter
 */
document.addEventListener('keydown', function(e) {
	var key = e.keyCode;
	if (key == 13) {
		var word = document.getElementById("hash_result").innerHTML;
		pass.insert(word);
	}
});

/*
 * If user enters, then exits, then enters qtip, refocus passphrase
 * (ondomloaded is catching this, but onshow can't reach inside the iframe
 *  to focus because of security restrictions -- use post message)
 */
window.addEventListener('message',function(e) {
	document.getElementById('hash_phrase').focus();
});