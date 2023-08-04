// ==UserScript==
// @name         EliRedirect
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://politicsandwar.com/nation/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=politicsandwar.com
// @grant        none
// ==/UserScript==

(async function () {
  "use strict";

  if (!window.location.href.includes("request")) {
    return;
  }


  var vars = {};
  var parts = window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
    }
  );

  const id = window.location.href.match(/id=(\d+)/)[1];

  const linkElement = document.querySelector('a[href*="/alliance/"]');

  const href = linkElement.getAttribute("href");
  const alliance = href.match(/id=(\d+)/)[1];

  var url = `https://politicsandwar.com/alliance/id=${alliance}&display=bank`;

  if (vars["recipient"]) {
    url += "&recipient=" + vars["recipient"];
  } else if (id) {
    const apiUrl = 'https://api.politicsandwar.com/graphql?api_key=bce6428a6a9a385eb9c3';
    const query = `{
      nations(first: 1, id: ${id}) {
        data {
          nation_name
        }
      }
    }`;

    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
      .then(response => response.json())
      .then(data => {
        const name = data.data.nations.data[0].nation_name;
        url += `&recipient=${encodeURIComponent(name)}&type=Nation`;
      })
      .catch(error => {
        console.error('Error:', error);
      });

  } else {
    return;
  }

  ['uranium', 'iron', 'bauxite', 'coal', 'oil', 'steel', 'munitions', 'aluminum', 'gasoline', 'money', 'type', 'note']
    .forEach(param => {
      if (vars[param]) {
        url += "&" + param + "=" + vars[param];
      }
    });


  window.location.href = url;

})();
