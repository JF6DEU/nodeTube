const http = require("http");
const Handlebars = require("handlebars");
const file = require("fs");
const AbortController = require('abort-controller');

const invidiousjson = "https://api.invidious.io/instances.json?pretty=1&sort_by=type,users";
let apis = ["https://invidious.f5.si", "https://lekker.gay", "https://iv.duti.dev", "https://invidious.jing.rocks"];
/*
    fetch(invidiousjson)
    .then(r => r.json())
    .then((d) => {
        d.forEach((ar, count) => {
            if (d[count][0].indexOf(".onion") == -1 && d[count][0].indexOf(".i2p") == -1){
                apis.push("https://"+d[count][0]+"/");
            }
        });
    })
    .catch((e) => {console.error(e)});
*/

let dt_post = new Array();
dt_post["keiji_send"] = "";
const server = http.createServer(async (request, response) => {
    let message;
    let urls = new URL(`http://${process.env.HOST ?? 'localhost'}${request.url}`);
    function returnTemplate(frompath, templatecontext){
        try{
            let templatedata = file.readFileSync(frompath, {encording: "UTF-8", flag: "r"}).toString();
            let template = Handlebars.compile(templatedata, {noEscape: true});
            return template(templatecontext);
        } catch(e){
            if (e.code == "ENOENT"){
                console.error("No such template!!");
            }
        }
    }
    if (urls.pathname == "/main.jpg"){
        response.writeHead(200, {
            "Content-Type": "image/jpg; charset=utf-8"
        });
        message = file.readFileSync("./templates/main.jpg", "binary");
        response.end(message, "binary");
        return;
    }
    if (apis.length == 0){
        response.writeHead(503, {
            "Content-Type": "text/html"
        });
        response.end("<meta charset=\"UTF-8\">ERROR! APIを使い果たしました！インスタンスを新しく立ててください！<br>※これは人気があるインスタンスに多いです。");
    }
    if (typeof request.headers.cookie == "undefined" || request.headers.cookie.indexOf("gz") == -1 && ( request.headers.cookie.split(";").map((a) => a.split("=")).find((i) => i == "gz") != "undefined" && request.headers.cookie.split(";").map((a) => a.split("=")).find((i) => i[0] == "gz")[1] != "ok")){
        message = returnTemplate("./templates/gizou.html", {});
        response.end(message);
        return;
    }
    if (request.method == "POST"){
        switch(urls.pathname){
            case "/writekeiji.php":
                return postdata_get("keiji_send");
                break;
            default:
                response.writeHead(400, {
                    "Content-Type": "text/html"
                });
                response.end("<h1>400 Bad request</h1>");
                break;
        }
        function postdata_get(arrname){
            dt_post[arrname] = "";
            request.on('data', function (data) {
                dt_post[arrname] += data;
            });
            request.on('end', async function () {
                response.writeHead(200, {
                    "Content-Type": "text/html"
                });
                let resp;
                switch(arrname){
                    case "keiji_send":
                        await fetch("https://keiji.jf6deu.net/writekeiji.php", {method:"POST", headers: {'Content-type':'application/json'}, body:dt_post[arrname]})
                            .then((r) => r.text())
                            .then((r) => {resp = r})
                            .catch((e) => console.error(e));
                }
                response.end(resp);
            });
            return;
        }
    }
    if (request.url == undefined){
        message = returnTemplate("./templates/error/404.html", {requesturl:"undefined"});
    } else {
        switch(urls.pathname){
            case "/":
                response.writeHead(200, {
                    "Content-Type": "text/html"
                });
                message = returnTemplate("./templates/search.html", {});
                break;
            case "/css/reset.css":
                response.writeHead(200, {
                    "Content-Type": "text/css"
                });
                message = returnTemplate("./templates/css/reset.css", {});
                break;
            case "/suggest":
                if (urls.searchParams.get("q") == null){
                    response.writeHead(207, {
                        "Content-Type": "application/json"
                    });
                    message = returnTemplate("./templates/renderjson", {json: JSON.stringify({error: "Too short parameters."})});
                } else {
                    response.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    let suggest = [];
                    let params = urls.searchParams.get("q");
                    if (params.length >= 120){
                        params = "";
                    }
                    params = params.replace(".", "").replace("/", "").replace("&", "").replace("?", "");
                    suggestjson = await fetch("https://ac.duckduckgo.com/ac/?q="+params).then(r => r.json()).then(r => {return r});
                    suggestjson.forEach((rdata) => {
                        suggest.push(rdata.phrase);
                    });
                    message = returnTemplate("./templates/renderjson", {json: JSON.stringify(suggest)}, 200, "application/json");
                }
                break;
            case "/search":
                if (urls.searchParams.get("q") == null || urls.searchParams.get("page") == null){
                    response.writeHead(207, {
                        "Content-Type": "text/html"
                    });
                    message = returnTemplate("./templates/renderjson", {json: "<meta charset=UTF-8>誰やパラメータを渡してないやつ(っ °Д °;)っ"});
                } else {
                    response.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                    let params = urls.searchParams.get("q");
                    let page = urls.searchParams.get("page");
                    if (isNaN(Number(page))){
                        page = 1;
                    }
                    page = Number(page);
                    if (page >= 200){
                        page = 1;
                    }
                    if (params.length >= 120){
                        params = "";
                    }
                    params = params.replace(".", "");
                    params = encodeURIComponent(params);
                    let searchresult = await fetchapi(`api/v1/search?q=${params}&page=${page}`);
                    message = returnTemplate("./templates/searchresult.html", {returned: JSON.stringify(searchresult)});
                }
                break;
            case "/watch":
                if (urls.searchParams.get("v") == null || urls.searchParams.get("v").length >= 50){
                    response.writeHead(207, {
                        "Content-Type": "text/html"
                    });
                    message = returnTemplate("./templates/renderjson", {json: "<meta charset=UTF-8>誰やパラメータを渡してないやつ(っ °Д °;)っ"});
                } else {
                    let outform = {};
                    response.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                    let v = urls.searchParams.get("v").replace(".", "").replace("/", "").replace("&", "").replace("?", "").replace("|", "").replace("(", "").replace(")", "");
                    let getresult = await fetchapi(`api/v1/videos/${v}`);
                    message = returnTemplate("./templates/watch.html", {downdata: JSON.stringify(getresult)});
                }
                break;
            case "/keiji.html":
                message = returnTemplate("./templates/keiji.html", {});
                break;
            case "/outjson.php":
                    response.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                await fetch("https://keiji.jf6deu.net/outjson.php")
                    .then((r) => r.text())
                    .then((r) => {message = r})
                    .catch((e) => console.error(e));
                break;
            default:
                response.writeHead(404, {
                    "Content-Type": "text/html"
                });
                message = returnTemplate("./templates/error/404.html", {requesturl:request.url});
                break;
        }
    }
    response.end(message);
});
async function fetchapi(urls){
    if (apis.length == 0){
        return false;
    }
    try{
        async function fetchCore(url) {
            let option = {};
            const controller = new AbortController();
            const timeout = setTimeout(() => { controller.abort() }, option.timeout || 30000); //30s
            try {
                const response = await fetch(url, {
                    signal: controller.signal // for timeout
                });
                if (!response.ok) {
                    const description = `status code:${response.status} , text:${response.statusText}`;
                    throw new Error(description);
                }
                return response;
            } catch(e) {
                if (e.code == "ECONNREFUSED" || e.code == "ENOTFOUND" || e.toString() == "TypeError: fetch failed"){
                    apis.shift();
                    throw new Error("API timed out");
                } else {
                    throw new Error("Other error"+e);
                }
            } finally {
                clearTimeout(timeout);
            }
        }
        const response = await fetchCore(apis[0]+urls);
        const respdata = await response.json();
        return new Promise(async (r) => r(respdata));
    } catch(e) {
        if (e.toString().split(":")[0] == "SyntaxError"){
            return new Promise((r) => r(undefined));
        }
        return new Promise(async (r) => r(await fetchapi(urls)));
    }
}

server.listen(4338);
