const version = require("jsonexport/package.json").version;
const jsonexport = require("jsonexport/dist")
const errElm = document.getElementById('error-elm')
const jSrcElm = document.getElementById('json-textarea')
const outElm = document.getElementById('output-textarea')

function update(){
  try{
    var ob = JSON.parse(jSrcElm.value.replace(/((^\s)|(\s$))/g,''));
  }catch(e){
    return handleError(e)
  }

  jsonexport(ob, handleExport)
}

function handleExport(err, data){
  if(err){
    return handleError(err)
  }else{
    errElm.style.display='none'
  }

  //example of to blob
  /*
    var blob = new Blob([data], {type: "text/comma-separated-values;charset=utf-8"});
    saveAs(blob, fileName)
  */

  outElm.value = data; // update output display
  
  // sharable url
  window.history.replaceState(null, null, window.location.pathname + "?json=" + jSrcElm.value); 
}

function handleError(err){
  //console.error(err)
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
    jSrcElm.value = params.json
  }

  update()
}

jSrcElm.addEventListener('keyup', update)

populateVersion();
loadUrlParams();
