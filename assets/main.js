window.onload = function() {
    var cList;
    
    function getAssets(filename) {
        return new Promise(function(r) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', chrome.extension.getURL(filename), true);
            xhr.onreadystatechange = function() {
                if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    r(xhr.responseText);
                }
            };
            xhr.send();
        });
    }
    function detectTA(e) {
        if(e.target.id == "edit-page-textarea") {
            var s = document.createElement("style");
            s.innerHTML = '.candyBox {background: #fff;box-shadow: 1px 1px 3px #aaa;font-family: courier;font-size: .8em;max-height: 6rem;max-width: 10rem;overflow-y: scroll;position: absolute;text-align: left;width: 99rem;}.candyBox a {cursor: pointer;display: block;padding: .35em .5em;transition: all .175s ease-in-out;}.candyBox a span {display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 1;overflow: hidden;white-space: pre;}.candyBox a:hover {background: #b01;color: #fff;}';
            document.head.appendChild(s);
            var p = e.target.parentNode;
            p.style.position = "relative";
            e.target.style.outline = "solid 2px #b01";
            
            e.target.oninput = function() {
                candyBox(e.target, p, cList);
            }
            document.body.removeEventListener("click", detectTA);
        }
    }
    function candyBox(t, p, cList) {
        for (var a of document.querySelectorAll(".candyBox")) {
            a.remove();
        }
        function getCaret(node) {
            if (node.selectionStart) {
                return node.selectionStart;
            } else if (!document.selection) {
                return 0;
            }
            var c = "\001"
              , sel = document.selection.createRange()
              , dul = sel.duplicate()
              , len = 0;
            dul.moveToElementText(node);
            sel.text = c;
            len = dul.text.indexOf(c);
            sel.moveStart('character', -1);
            sel.text = "";
            return len;
        }
        var index = getCaret(t);

        var before = t.value.substring(0, index);
        var after = t.value.substring(index);

        var bef_m = before.match(/([\s\S]*?\n|^)([a-zA-Z\[\"]+?)$/);
        if (!bef_m)
            return;
        var cand = cList.filter(v=>v.match(new RegExp("^" + bef_m[2].replace(/\[/g, "\\["),"i")));
        if (!cand.length)
            return;
        var bef = bef_m[1];
        var aft = after;

        var div = document.createElement("div");

        var box = document.createElement("div");

        box.classList.add("candyBox");

        var t_style = window.getComputedStyle(t);
        for (var k in t_style) {
            div.style[k] = t_style[k];
        }
        var scale = t_style.transform.split(/[^d.]/).filter(function(v) {
            return v
        });
        var scale_x = scale[0];
        var scale_y = scale[3];

        div.innerHTML = before;
        var span = document.createElement('span');
        span.innerHTML = '&nbsp;';
        div.scrollTop = div.scrollHeight;
        div.appendChild(span);
        document.body.appendChild(div);
        var d = div.getBoundingClientRect();
        var s = span.getBoundingClientRect();
        var r = {
            top: s.top - d.top,
            left: s.left - d.left
        };
        div.remove();

        box.style.top = 'calc(' + (r.top - t.scrollTop * (scale_y ? Number(scale_y) : 1)) + 'px + 1rem)';
        box.style.left = (r.left - t.scrollLeft * (scale_x ? Number(scale_x) : 1)) + 'px';
        p.appendChild(box);
        var width = 0;

        for (var c of cand) {
            var l = document.createElement("a");
            var s = document.createElement("span");
            s.innerHTML = c;
            l.appendChild(s);
            box.appendChild(l);
            width = width < s.clientWidth ? s.clientWidth : width;
            l.onclick = function(e) {
                var a = bef + e.target.innerText;
                t.value = a + aft;
                t.setSelectionRange(a.length, a.length);
                t.focus();
                box.remove();
            }
        }

        box.style.width = `calc(1.8em + ${width}px)`;
    }
    
    getAssets('list.json').then(function(r) {
        var base = JSON.parse(r);
        cList = base.list;
        document.body.addEventListener("click", detectTA);
    })
}
