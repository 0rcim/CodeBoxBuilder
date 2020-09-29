let icons = {
    "babelrc": "babel",
    "c": "c",
    "cpp": "cpp",
    "cs": "csharp",
    "css": "css",
    "txt": "document",
    "html": "html",
    "htm": "html",
    "js": "javascript",
    "json": "json",
    "lua": "lua",
    "package.json": "nodejs",
    "php": "php",
    "py": "python",
    "jsx": "react",
    "tsx": "react_ts",
    "scss": "scss",
    "swift": "swift",
    "ts": "typescript",
    "vue": "vue",
    "webpack.config.js": "webpack"
};
/* 兼容 IE, getComputedStyle */
if (!window.getComputedStyle) {
    window.getComputedStyle = function(el, pseudo) {
        this.el = el;
        this.getPropertyValue = function(prop) {
            var re = /(\-([a-z]){1})/g;
            if (prop == 'float') prop = 'styleFloat';
            if (re.test(prop)) {
                prop = prop.replace(re, function () {
                    return arguments[2].toUpperCase();
                });
            }
            return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        }
        return this;
    }
};
window.onload = () => {
    document.onpaste = (e) => {
        var cb_str = e.clipboardData.getData('text\/html') || e.clipboardData.getData('text\/plain');
        var handled = cb_handler(cb_str);
        document.querySelector(".code--box").id = `code--id--${new Date().valueOf()}`;
        window.handled = handled;
        console.log(handled);
        let syntaxColor = {};
        for (let m=0, l=handled["lines_arr"].length; m<l; m++) {
            handled["lines_arr"][m]["hl_group"].forEach(item => {
                let color = item.style.color;
                syntaxColor[color] || (syntaxColor[color] = []);
                syntaxColor[color].indexOf(item.txt) === -1 && syntaxColor[color].push(item.txt);
            });
        };
        window.syntaxColor = syntaxColor;
        console.log(syntaxColor);
        handled.globalStyle["white-space"] = "no-wrap";
        handled.globalStyle["font-size"] = "15px";
        handled.globalStyle["line-height"] = "25px";
        handled.globalStyle["font-family"] = " monospace, " + handled.globalStyle["font-family"];
        var style = `.code--content{${stylefy(handled.globalStyle)}}.code--box{background-color:${handled.globalStyle["background-color"]}}`;
        let cssGroup = {};
        Object.keys(syntaxColor).forEach((item, index) => {
            style += `.c--${index}{color: ${item};}`;
            cssGroup[item] = `c--${index}`;
        });
        window.cssGroup = cssGroup;
        let style_tag = document.createElement("style");
        style_tag.id = "resStyle";
        style_tag.innerText = style;
        document.head.appendChild(style_tag);
        let lns = document.querySelector(".code--numbers_list tbody");
        let content = document.querySelector(".code--lines tbody");
        for (let m=0, l=handled["lines_arr"].length; m<l; m++) {
            content.appendChild(
                td(handled["lines_arr"][m]["hl_group"].map(item => {
                    return {txt: item.txt, cName: cssGroup[item.style.color]}
                }))
            );
            let oTr = document.createElement("tr"), oTd = document.createElement("td");
            oTr.appendChild(oTd);
            oTd.innerText = m+1;
            lns.appendChild(oTr)
        };
        // console.log(Object.keys(syntaxColor))
        // console.log(style)
        addCopyBtnEvents();
    }
};
var td = (txt_arr) => {
    let oTr = document.createElement("tr");
    let oTd = document.createElement("td");
    oTr.appendChild(oTd);
    let span = (txt, cName) => {
        let oSpan = document.createElement("span");
        cName && (oSpan.className = cName);
        oSpan.innerHTML = txt;
        return oSpan;
    };
    txt_arr.forEach(item => {
        oTd.appendChild(span(item.txt, item.cName));
    });
    return oTr;
};
var cssfy = str => {
    let arr = str.split(/;[\ ]?/);
    let json = {};
    arr.forEach(item => {
        let r = item.split(/:[\ ]?/);
        r[0] && (json[r[0]] = r[1]);
    });
    // console.log(arr)
    return json;
};
var stylefy = obj => {
    let aa = [];
    for (let key in obj) {
        let a = [key, obj[key]].join(":");
        aa.push(a);
    }
    return aa.join(";")
};
var cb_handler = function (d) {
    // [\s|\S]* => 匹配任意长度的字符串
    // [\r\n]* => 匹配任意次数的回车换行
    let handle = {};
    let data = d.replace(/<html>[\r\n]*<body>[\r\n]*<\!--StartFragment-->([\s|\S]*)<\!--EndFragment-->[\r\n]*<\/body>[\r\n]*<\/html>/, "$1");
    data = data.replace(/<br>/g, '<div><span style="">&nbsp;</span></div>');
    // 编辑器全局的 style
    var gs = data.match(/<div style="(.*)"><div>/);
    // 如果粘贴源文本格式不符（并非来自 VS）
    !gs && console.log("剪切板内容的格式不正确:\n", data)
    if (!gs) return handle;
    gs && 
        (document.querySelector(".card1").style.display = "none") && 
        (document.querySelector(".card2").style.display = "block");
    let globalStyle = cssfy(gs[1]);
    let lines = data.match(/<div><span [\s|\S]*<\/span><\/div>/)[0].replace(/<\/div><div>/g, "</div>\n<div>");
    let line_arr = lines.split("\n");
    let lines_arr = line_arr.map((item, index) => {
        let tmp = {
            "line_on": index
        };
        let ss = item.replace(/<div>([\s|\S]*)<\/div>/, "$1").replace(/<\/span><span/g, "</span>\n<span");
        let ss_arr = ss.split("\n");
        let strs = []
        tmp["hl_group"] = ss_arr.map(i => {
            let a = i.match(/>([\s|\S]*)<\/span>/)[1];
            strs.push(a);
            // console.log(a)
            // console.log(i.match(/style="(.*)"/)[1], i.match(/style="(.*)">/));
            return {
                "style": cssfy(i.match(/style="(.*)">/)[1]),
                "txt": a.replace(/\ /g, "&nbsp;")
            }
        });
        tmp["plain_txt"] = strs.join("");
        return tmp;
    });
    handle["globalStyle"] = globalStyle;
    handle["lines_arr"] = lines_arr;
    return handle;
};
document.getElementById("ok").onclick = () => {
    document.querySelector(".card3").style.display = "none";
    document.querySelector(".code--container").style.display = "block";
}
document.getElementById("submit").onclick = () => {
    document.querySelector(".card2").style.display = "none";
    document.querySelector(".card3").style.display = "block";
    let fName = document.forms["fm"]["fName"].value,
        boxHt = document.forms["fm"]["boxHt"].value,
        copyBtn = document.forms["fm"]["copyBtn"].checked,
        addAllStyle = document.forms["fm"]["addAllStyle"].checked;
    let cn = document.querySelector(".code--content");
    if (!copyBtn) {
        document.querySelectorAll(".code--copy").forEach(item => {
            item.style.display = "none";
        });
    }
    if (boxHt) {
        cn.style.maxHeight = boxHt.replace(/px/, "") + "px";
        parseFloat(window.getComputedStyle(document.querySelector(".code--lines"), "").getPropertyValue("height")) < parseFloat(boxHt) &&
            document.querySelectorAll(".code--ex_sh").forEach(item => {
                item.style.display = "none"
            })
    }else if(fName){
        parseFloat(window.getComputedStyle(document.querySelector(".code--lines"), "").getPropertyValue("height")) < 200 &&
            document.querySelectorAll(".code--ex_sh").forEach(item => {
                item.style.display = "none"
            })
    }
    if (fName) {
        document.querySelectorAll(".code--name span").forEach(item => {
            item.innerText = fName;
        });
        let n = fName.split("\.");
        let ext_name = n[n.length-1];
        let cl = "";
        cl = ext_name in icons ? icons[ext_name] : "document";
        fName.replace(/\ /g, "0") in icons && (cl = icons[fName]);
        document.querySelectorAll(".code--stamp span").forEach(item => {
            item.className = "code---"+cl;
        });
        // if (parseFloat(boxHt) < 0) cn.style.maxHeight = "none";
    }else{
        if (boxHt) cn.style.maxHeight = boxHt.replace(/px/, "") + "px";
        // if (parseFloat(boxHt) < 0) cn.style.maxHeight = "none";
        document.querySelectorAll(".code--title").forEach(item => {
            item.style.display = "none";
        });
    };
    if (parseFloat(boxHt) < 0) {
        cn.style.maxHeight = "none";
        document.querySelectorAll(".code--ex_sh").forEach(item => {
            item.style.display = "none"
        })
    }
    if (addAllStyle) {
        let newCss = {}
        window.handled.lines_arr.forEach(item => {
            item.hl_group.forEach(s => {
                newCss[s.style.color] || (newCss[s.style.color] = {});
                for (var m in s.style) {
                    if (m==="color") continue;
                    newCss[s.style.color][m] || (newCss[s.style.color][m] = s.style[m]);
                }
            })
        });
        for (let x in newCss) Object.keys(newCss[x]).length && (document.getElementById("resStyle").innerText += `.${window.cssGroup[x]}{${stylefy(newCss[x])}}`);
    }
    document.querySelector(".code--box").dataset.css = document.getElementById("resStyle").innerText;
    document.getElementById("source_html").value = document.querySelector(".code--container").innerHTML;
    
    solveDatasetCSS();
    addExpandBtnEvents();
}