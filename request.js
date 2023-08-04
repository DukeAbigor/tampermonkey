// ==UserScript==
// @name         EliRequest
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://politicsandwar.com/alliance/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=politicsandwar.com
// @grant        none
// ==/UserScript==
function setValue(name, value) {
  const inputElement = document.querySelector(`input[name="${name}"]`);

  if (inputElement) {
    inputElement.value = value;
  }
}

(function () {
  "use strict";
  const inputElement = document.querySelector('input[name="depmoney"]');


  var vars = {};
  var parts = window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
    }
  );

  ['recipient', 'uranium', 'iron', 'bauxite', 'coal', 'oil', 'steel', 'munitions', 'aluminum', 'gasoline', 'money', 'type', 'note']
    .forEach(param => {
      if (vars[param]) {
        setValue(`with${param}`, decodeURIComponent(vars[param]));
      }
    });

})();
