// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Javascript implementation of Java's hashCode function
 */
String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/* backwards compatibility */
if (!chrome.runtime) {
    // Chrome 20-21
    chrome.runtime = chrome.extension;
} else if(!chrome.runtime.onMessage) {
    // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
}

var pass = {
  /**
   * 16-digit random password
   */
  HexToBase64: function(string) {
		return btoa(string.match(/\w{2}/g).map(function(a){return String.fromCharCode(parseInt(a,16));}).join(""));
	},
	
  /**
   * The algorithm
   */
  hash: function() {
		// get phrase & site
    var phrase = document.getElementById("hash_phrase").value;
    var site = document.getElementById("hash_site").value;
		var plaintext = phrase + ' ' + site;
		
		var ciphertext = SHA256(plaintext);
		ciphertext = this.HexToBase64(ciphertext);
		ciphertext = ciphertext.substring(0,16);
		document.getElementById("hash_result").innerHTML = ciphertext;
  },
  
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

document.addEventListener('DOMContentLoaded', function() {
	var hash_click = document.getElementById('hash_phrase');
	hash_click.addEventListener('keyup', function() {
		pass.hash();
	});

	var hash_insert = document.getElementById('hash_insert');
	hash_insert.addEventListener('click', function() {
		var word = document.getElementById("hash_result").innerHTML;
		pass.insert(word);
	});
	
	var hash_site = document.getElementById('hash_site');
	var hash_phrase = document.getElementById('hash_phrase');
	
	chrome.storage.sync.get(['site','domain'], function (result) {
		//console.log(result);
		site = result.site;
		domain = result.domain;
		
		hash_site.value = site+' | ';
		hash_site.size = site.length;
		hash_phrase.size = 24 - site.length;
		hash_site.style.backgroundImage = "url('https://www.google.com/s2/favicons?domain="+domain+"')";
		hash_site.style.paddingLeft = "20px";
		hash_site.style.backgroundRepeat = "no-repeat";
	});
	
});