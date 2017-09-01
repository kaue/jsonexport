const jsonexport = require("jsonexport/dist")
const errElm = document.getElementById('error-elm')
const jSrcElm = document.getElementById('json-textarea')
const outElm = document.getElementById('output-textarea')

function update(){

  try{
    var ob = JSON.parse(jSrcElm.value.replace(/((^\s)|(\s$))/g,''))
  }catch(e){
    return handleError(e)
  }

  jsonexport(ob, handleExport)
}

function handleExport(err, data){
  if(err){
    return handlerError(err)
  }else{
    errElm.style.display='none'
  }

  //example of to blob
  /*
    var blob = new Blob([data], {type: "text/comma-separated-values;charset=utf-8"});
    saveAs(blob, fileName)
  */

  outElm.value = data
}

function handleError(err){
  //console.error(err)
  errElm.innerHTML = err.toString()
  errElm.style.display=''
}

jSrcElm.addEventListener('keyup', update)

update()
