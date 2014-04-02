//This code is from jQuery
function addClassToElement(elem,value){
    var rspaces = /\s+/;
    var classNames = (value || "").split( rspaces );
    var className = " " + elem.className + " ",
        setClass = elem.className;
    for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
        if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
            setClass += " " + classNames[c];
        }
    }
    elem.className = setClass.replace(/^\s+|\s+$/g,'');//trim
}
function removeClassFromElement(elem,value){
    var rspaces = /\s+/;
    var rclass = /[\n\t]/g
    var classNames = (value || "").split( rspaces );
    var className = (" " + elem.className + " ").replace(rclass, " ");
    for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
        className = className.replace(" " + classNames[c] + " ", " ");
    }
    elem.className = className.replace(/^\s+|\s+$/g,'');//trim
}
