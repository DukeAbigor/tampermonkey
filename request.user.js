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
  let inputElement;
  if (name === "withtype") {
    inputElement = document.querySelector(`select[name="${name}"]`);
  } else {
    inputElement = document.querySelector(`input[name="${name}"]`);
  }

  if (inputElement) {
    inputElement.value = value;
  }
}

let debounceTimeout;

function debounce(func, delay) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
}

const apiUrl = 'https://api.politicsandwar.com/graphql?api_key=bce6428a6a9a385eb9c3';
async function getName(id) {
  const query = `{
    nations(first: 1, id: ${id}) {
      data {
        nation_name
      }
    }
  }`;

  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
    .then(response => response.json())
    .then(data => {
      if (!data.data.nations.data[0]) {
        return;
      }
      const name = data.data.nations.data[0].nation_name;
      return name;
    })
    .catch(error => {
      console.error('Error:', error);
      return;
    });
}

async function getIdByName(name) {
  const query = `{
    nations(first: 1, nation_name: "${name}") {
      data {
        id
      }
    }
  }`;

  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
    .then(response => response.json())
    .then(data => {
      if (!data.data.nations.data[0]) {
        return;
      }
      const id = data.data.nations.data[0].nationid;
      return id;
    })
    .catch(error => {
      console.error('Error:', error);
      return;
    });
}

async function getIdByLeader(name) {
  const query = `{
    nations(first: 1, leader_name: "${name}") {
      data {
        id
      }
    }
  }`;

  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
    .then(response => response.json())
    .then(data => {
      if (!data.data.nations.data[0]) {
        return;
      }
      const id = data.data.nations.data[0].nationid;
      return id;
    })
    .catch(error => {
      console.error('Error:', error);
      return;
    });
}



(async function () {
  "use strict";

  const container = document.createElement('container');
  container.style.display = 'flex';
  container.style.alignItems = 'center';

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Paste request here...';
  textarea.rows = '5';
  textarea.cols = '40';
  textarea.name = 'withrequest';
  textarea.style.display = 'block';
  textarea.style["margin-left"] = '15px';
  textarea.style.width = '80%';
  textarea.style.resize = 'vertical';
  textarea.style["margin-bottom"] = '20px';

  const separator = document.createElement('input');
  separator.type = 'text';
  separator.placeholder = 'Separator';
  separator.style.margin = '0 auto';
  separator.style["margin-bottom"] = '20px';
  separator.style["margin-right"] = '20px';
  separator.style["margin-left"] = '10px';
  separator.style.flex = '1';

  container.appendChild(textarea);
  container.appendChild(separator);

  async function updateArray() {
    const array = separator.value ? textarea.value.split(separator.value) : textarea.value.split('\n');

    const aliases = {
      'alu': 'aluminum',
      'cash': 'money',
      'gas': 'gasoline',
      'muni': 'munitions',
      'munis': 'munitions',
      'baux': 'bauxite',
      'ura': 'uranium',
      'from': 'note',
      'sk': 'safekeeping',
      'cash': 'money',
      'alum': 'aluminum',
    };

    const resources = [
      'uranium',
      'iron',
      'bauxite',
      'coal',
      'oil',
      'steel',
      'munitions',
      'aluminum',
      'gasoline',
      'food',
      'money'
    ];

    const modified = [
      'uranium',
      'iron',
      'bauxite',
      'coal',
      'oil',
      'steel',
      'munitions',
      'aluminum',
      'gasoline',
      'money',
      'food',
      'note',
      'recipient',
    ];
    const keywords = ['note', 'leader', 'nation', 'alliance'];

    const expandedArray = await Promise.all(array.map(async item => {
      item = item.toLocaleLowerCase();

      item = item.replace(/(\d+)\s*([kmbt])/ig, (match, number, multiplier) => {
        const expandedNumber =
          multiplier === 'k' ? parseFloat(number) * 1000 :
          multiplier === 'm' ? parseFloat(number) * 1000000 :
          multiplier === 'b' ? parseFloat(number) * 1000000000 :
          multiplier === 't' ? parseFloat(number) * 1000000000000 :
          parseFloat(number);

        return expandedNumber.toString();
      });

      item = item.replaceAll(/\$(\d+)/g, "$1 money");

      for (const alias in aliases) {
        if (aliases.hasOwnProperty(alias)) {
          const regex = new RegExp(`\\b${alias}\\b`, 'ig');
          item = item.replace(regex, aliases[alias]);
        }
      }

      const idRegex = /id=(\d+)/;
      const idMatch = item.match(idRegex);
      if (idMatch) {
        const idNumber = idMatch[1];
        const name = await getName(idNumber);
        item = `nation ${name}`;
      }

      if (item.includes('safekeeping') && !item.includes('note')) {
        item  = 'note ' + item;
      }

      const resource = resources.find(resource => item.includes(resource));
      if (resource) {
        let amount = item.match(/(\d+)/);
        if (amount) {
          setValue(`with${resource}`, amount[1]);
          modified.splice(modified.indexOf(resource), 1);
        }
      }

      const keywordMatch = keywords.find(keyword => item.toLowerCase().includes(keyword));
      if (keywordMatch) {
          const keywordIndex = item.indexOf(keywordMatch);
          const keywordText = item.slice(keywordIndex + keywordMatch.length + 1); // Remove keyword and space from the string
          if (keywordMatch === 'note') {
            setValue('withnote', keywordText);
            modified.splice(modified.indexOf(keywordMatch), 1);
          } else {
            setValue(`withrecipient`, keywordText);
            setValue(`withtype`, keywordMatch);
            modified.splice(modified.indexOf('recipient'), 1);
          }
      }

      return item;
    }));


    modified.forEach(resource => {
      if (resource === 'note' || resource === 'recipient') {
        setValue(`with${resource}`, '');
      } else {
        setValue(`with${resource}`, 0);
      }
    });
    console.log(expandedArray);
  }

  textarea.addEventListener('input', () => {
    debounce(updateArray, 1000);
  });
  separator.addEventListener('input',  () => {
    debounce(updateArray, 1000);
  });

  const parentElement = document.querySelector('hr+ .row');
  if (parentElement) {
      parentElement.insertBefore(container, parentElement.firstChild);
  }


  var vars = {};
  var parts = window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
    }
  );
  if (vars.type === 'ID') {
    let name = await getName(vars.recipient);
    if (name) {
      setValue('withrecipient', name);
      setValue('withtype', 'Nation');
    }

  } else if(vars.type) {
    setValue('withrecipient', vars.recipient)
    setValue('withtype', vars.type)
  }



  ['uranium', 'iron', 'bauxite', 'coal', 'oil', 'steel', 'munitions', 'aluminum', 'gasoline', 'money', 'note']
    .forEach(param => {
      if (vars[param]) {
        setValue(`with${param}`, decodeURIComponent(vars[param]));
      }
    });

})();
