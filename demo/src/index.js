const version = require("jsonexport/package.json").version;
const jsonexport = require("jsonexport/dist")
const errElm = document.getElementById('error-elm')
const jSrcElm = document.getElementById('json-textarea')
const outElm = document.getElementById('output-textarea')

const defaultData = [{
  "name": "Bob",
  "lastname": "Smith",
  "family": {
    "name": "Peter",
    "type": "Father"
  }
},{
  "name": "James",
  "lastname": "David",
  "family":{
    "name": "Julie",
    "type": "Mother"
  }
},{
  "name": "Robert",
  "lastname": "Miller",
  "family": null,
  "location": [1231,3214,4214]
},{
"name": "David",
"lastname": "Martin",
"nickname": "dmartin"
}];

// allow html access to methods
window.update = update;
window.downloadResult = downloadResult;

function update(){
  var json = "";

  try{
    json = JSON.parse(jSrcElm.value.replace(/((^\s)|(\s$))/g,''));
  }catch(e){
    return handleError(e)
  }

  const options = getOptions();

  jsonexport(json, options, function(err,data) {
    if (err) {
      return handleError(err)
    }else{
      errElm.style.display = 'none'
    }

    outElm.value = data; // update output display

    updateDownload();
    updateUrl(json, options);
  });
}

function updateUrl(json, options) {
  const jsonString = JSON.stringify(json);
  const jsonOptions = JSON.stringify(options);
  
  const urlVars = "json=" + jsonString + "&options=" + jsonOptions;
  const newUrl = window.location.pathname + "?" + urlVars;
  
  window.history.replaceState(null, null, newUrl);
}

function updateDownload() {
  const data = outElm.value;
  var blob = new Blob([data], {type: "text/comma-separated-values;charset=utf-8"});
  const fileName = "jsonexport" + Date.now() + ".csv";
  const target = document.getElementById("downloadResult");
  target.href =  URL.createObjectURL(blob);
  target.download = fileName;
}

function handleError(err){
  errElm.innerHTML = err.toString()
  errElm.style.display=''
}

function populateVersion() {
  const versions = [];
  Array.prototype.push.apply(versions, document.getElementsByClassName('versionOutput'))
  versions.forEach(function(e) {
    e.innerHTML = version;
  });
}

function getUrlParams(url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

function loadUrlParams() {
  const params = getUrlParams(window.location.href);

  if (params.json) {    
    try {
      jSrcElm.value = JSON.stringify(JSON.parse(params.json), null, 2);
    } catch (err) {
      jSrcElm.value = params.json
    }
  } else {
    jSrcElm.value = JSON.stringify(defaultData, null, 2);
  }

  update()
}

function getOptions() {
  const options = {};
  const inputArray = [];
  Array.prototype.push.apply(inputArray, document.getElementById('options-wrap').getElementsByTagName("input"));

  inputArray.forEach(function(input){
    if (input.type === 'checkbox') {
      if (input.checked) {
        options[input.getAttribute('name')] = input.value === "false" ? false : true;
      }
    } else {
      if (input.value) {
        options[input.getAttribute('name')] = input.value;
      }
    }
  });

  return options;
}

function populateOptionWrap() {
  const wrap = document.getElementById('options-wrap');
  const template = document.getElementById('options-template');
  wrap.innerHTML = template.innerHTML;

  const params = getUrlParams(window.location.href);

  if (params.options) {    
    var urlOptions = {};

    try {
      urlOptions = JSON.parse(params.options);
    } catch (err) {
      return console.error('Bad url options parameters', err);
    }

    const targets = [];
    Array.prototype.push.apply(targets, wrap.getElementsByTagName('input'));

    Object.keys(urlOptions).forEach(function(key){
      const target = targets.find(function(input) {
        return input.getAttribute('name') === key
      });
      
      if (!target) {
        return;
      }

      const value = urlOptions[key];
      const type = target.getAttribute('type');
      if (type==="checkbox") {
        if (value.toString() == target.value) {
          target.checked = true;
        }
      } else {
        target.value = value;
      }
    });
  }
}

function startApp() {
  populateOptionWrap();
  populateVersion();
  loadUrlParams();
}

startApp();