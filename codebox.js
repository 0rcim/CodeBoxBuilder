function addExpandBtnEvents () {
    var btns = document.querySelectorAll(".code--ex_sh");
    var st = {"true": "EXPAND", "false": "SHRINK"};
    var codeBoxes = document.querySelectorAll(".code--box");
    for (var i=0, l=codeBoxes.length; i<l; i++) {
        codeBoxes[i].setAttribute("expanded", true);
        var btns = codeBoxes[i].querySelectorAll(".code--ex_sh");
        (function (idx) {
            for (var j=0, m=btns.length; j<m; j++) {
                btns[j].setAttribute("data-max-height", codeBoxes[i].querySelector(".code--content").style.maxHeight) || "200px";
                btns[j].onclick = function () {
                    var mh = this.getAttribute("data-max-height");
                    var bool = codeBoxes[idx].getAttribute("expaned") === "true";
                    codeBoxes[idx].querySelectorAll(".code--ex_sh span")[0].innerText = 
                    codeBoxes[idx].querySelectorAll(".code--ex_sh span")[1].innerText = st[bool];
                    codeBoxes[idx].querySelector(".code--content").style.maxHeight = bool ? mh : "none";
                    codeBoxes[idx].setAttribute("expaned", !bool);
                }
            }
        })(i)
    }
};
function addCopyBtnEvents () {
    var btns = document.querySelectorAll(".code--copy");
    for (var i=0, l=btns.length; i<l; i++) {
        btns[i].onclick = function () {
            var cn = this.parentNode.parentNode.parentNode.querySelector(".code--lines");
            selectText(cn);
            document.execCommand("Copy");
        }
    }
};
function selectText (text) {
    var bType = BrowserType();
    if(bType.isSafari){ // safari
        var selection = window.getSelection();
        selection.setBaseAndExtent(text, 0, text, 1);
    }else if(bType.isFF || bType.isOpera || bType.isChrome){
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }else{ // IE & others
        var range = document.body.createTextRange();  
        range.moveToElementText(text);  
        range.select();  
    }
};
function BrowserType () {  
    var userAgent = navigator.userAgent; //取得浏览器的 userAgent 字符串
    var typeis = {};
    typeis.isOpera = userAgent.indexOf("Opera") > -1; //判断是否 Opera 浏览器  
    typeis.isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !typeis.isOpera; //判断是否 IE 浏览器  
    typeis.isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; //判断是否 IE 的 Edge 浏览器  
    typeis.isFF = userAgent.indexOf("Firefox") > -1; //判断是否 Firefox 浏览器  
    typeis.isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否 Safari 浏览器 
    typeis.isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1; //判断 Chrome 浏览器
    return typeis;
};
function solveDatasetCSS () {
    var pageCodeBoxes = document.querySelectorAll(".code--box");
    for (var i=0, l=pageCodeBoxes.length; i<l; i++) {
        var c = document.createElement("style");
        var css = pageCodeBoxes[i].getAttribute("data-css");
        var n_css = css.replace(/([^0-9]?)(\.[^0-9]*--)/g, "$1#"+ pageCodeBoxes[i].id +" $2");
        c.innerText = n_css.replace("#" + pageCodeBoxes[i].id + " .code--box", ".code--box");
        document.head.appendChild(c);
    }
}