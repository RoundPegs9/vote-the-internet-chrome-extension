class SearchEngine {
    constructor(hostname) {
        this.hostname = hostname
    }
    isSearchEngine() {
        return this.hostname === "www.google.com" || this.hostname === "duckduckgo.com"
    }
    getHostname() {
        return this.hostname
    }
    getSearchEngine() {
        if (!this.isSearchEngine()) {
            return -1;
        }
        return this.getHostname() == "duckduckgo.com" ? 0 : 1;
    }
}


class ZenSites {
    constructor(hostname, pathname, zenmode) {
        this.hostname = hostname;
        this.pathname = pathname;
        this.zenmode = zenmode;
    }
    isZenSite() {
        return this.hostname === "www.youtube.com" || this.hostname === "www.chess.com" || this.hostname === "www.facebook.com" || this.hostname === "twitter.com" || this.hostname === "www.instagram.com" || this.hostname === "www.linkedin.com";
    }
    changeDisplay(elem, str)
    {
        if(elem !== null)
        {
            elem.style.display = str;
        }
    }

    youtube_custom() {
        let a = document.getElementById("secondary"),
        b = document.getElementById("secondary-inner"),
        c = document.getElementById("contentContainer"),
        d = document.getElementById("contents");
        
        if (this.zenmode && this.hostname === "www.youtube.com") {
            this.changeDisplay(a, "none");
            this.changeDisplay(b, "none");
            this.changeDisplay(c, "none");
            if(this.pathname === "/")
            {
                this.changeDisplay(d, "none");

                //considering there aren't any hashes in the urls already
                if (!window.location.hash) {
                    //setting window location
                    window.location = window.location + '#loaded';
                    //using reload() method to reload web page
                    window.location.reload();
                }
            }
            else
            {
                this.changeDisplay(d, "");
            }
        }
        else if (!this.zenmode && this.hostname === "www.youtube.com") {
            this.changeDisplay(a, "");
            this.changeDisplay(b, "");
            this.changeDisplay(c, "");
            this.changeDisplay(d, "");
        }
    }
    otherZenContent()
    {
        if(this.isZenSite() && this.zenmode)
        {
            document.body.style.display = "none";
        }
        else
        {
            document.body.style.display = "";
        }
    }
}


const currentTab = new SearchEngine(document.location.hostname);



const script_code = `
const apiURL = "https://vti-api.herokuapp.com/";
var getVoteCount = (hostname)=>{
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
    
        var upvote = 0;
        var downvote = 0;
        var credibility = "<br><span style='font-size:0.8em;'>NOT ENOUGH DATA</span>";
        
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            
            hasDataLoaded = true;

            const data = JSON.parse(xmlhttp.responseText);
            let code = data.code;
            if (code === 200) //data exists
            {
                upvote = data.data.path.upvotes;
                downvote = data.data.path.downvotes;
                var upvote_host = data.data.host.upvotes;
                var downvote_host = data.data.host.downvotes;
                
                credibility = 100*(upvote_host / (upvote_host + downvote_host)).toPrecision(3);
                if(credibility < 55)
                {
                    credibility = "<span style='color:#db2828!important'>" + credibility + "%</span>";
                }
                else
                {
                    credibility = "<span style='color:#21ba45!important;'>" + credibility + "%</span>";
                }
            }
            
            document.getElementById(hostname + "-0").innerHTML = "<span style='color:#21ba45!important;'><strong>Upvotes:</strong> " + upvote + "</span>";
            document.getElementById(hostname + "-1").innerHTML = "<span style='color:#db2828!important'><strong>Downvotes:</strong> " + downvote + "</span>";
            document.getElementById(hostname + "-2").innerHTML = "<strong>Overall credibility:</strong> " + credibility;
        }
    };
    xmlhttp.open("GET", apiURL + "stats?q=" + hostname, true);
    xmlhttp.send();
}`;

/**
 * CSS for tooltip
 */
const css_rules = [`
.vti-qasim {
    position: relative;
    display:inline-block;
    margin-left:20px;
    transition: all .2s ease-in-out;
}`, `
.vti-qasim div {
    display: none;
    
    position: absolute;
    top: 0;
    left:100%;
    margin-top: -30px;
    margin-left: 25px;
}`, `
.vti-qasim img:hover + div {
    cursor: pointer;
    display: block;
    width: 180px;
    line-height: 20px;
    padding: 8px;
    font-size: 14px;
    text-align: center;
    z-index: 999;
    color: black;
    background: rgb(255, 255, 255);
    border: 4px solid rgb(255, 255, 255);
    border-radius: 5px;
    text-shadow: rgba(0, 0, 0, 0.0980392) 1px 1px 1px;
    box-shadow: #333 -4px 4px 16px 2px;
    -webkit-transition: opacity 100ms ease-in;
    -o-transition: opacity 100ms ease-in;
    -moz-transition: opacity 100ms ease-in;
    transition: opacity 100ms ease-in;
    pointer-events: none;
}`, `
  .vti-qasim div:after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-width: 10px;
    border-style: solid;
    border-color: transparent #FFFFFF transparent transparent;
    top: 22px;
    left: -23px;
}`];


const vote_count_script = document.createElement("script");
vote_count_script.type = "text/javascript";
vote_count_script.appendChild(document.createTextNode(script_code));
document.body.appendChild(vote_count_script);


var startIndexSearch = (key_search, typeMedia) => {
    var elem = document.getElementsByClassName(key_search);
    const image_embed_src = "https://res.cloudinary.com/crammer/image/upload/v1589779046/thumbnail_erxrrp.png";
    for (let i = 0; i < elem.length; i++) {
        let item = elem[i];


        let url = "";
        if (typeMedia == 0)//duckduckgo focus
        {
            url = item.firstChild.hostname;
            if (item.firstChild.pathname.length > 1) {
                url += item.firstChild.pathname;
            }
        }
        else if (typeMedia == 1) //google
        {
            url = item.parentElement.hostname;
            if (item.parentElement.pathname.length > 1) {
                url += item.parentElement.pathname;
            }
        }

        /**
         * HTML for tooltip
         */
        var html_data = `
        <div <h3 style="text-align:center;"><strong style="letter-spacing:1px;word-spacing:2px;">VOTE THE INTERNET</strong><br>Crowdsourcing trust </h3>
            <p id="${url}-0"><span style='color:#21ba45!important;'><strong>Upvotes:</strong> 0</p>
            <p id="${url}-1"><span style='color:#db2828!important'><strong>Downvotes:</strong> 0</p>
            <p id="${url}-2"><strong>Overall credibility:</strong><br><span style='font-size:0.8em;'>NOT ENOUGH DATA</span></p>
        </div>`;
        if (typeMedia == 1) {
            item.parentElement.insertAdjacentHTML("afterend", `<div onmouseover="getVoteCount('${url}')" class="vti-qasim" id="${url}"><img src="${image_embed_src}" width=25 height=25>${html_data}</div>`);
        }
        else if (typeMedia == 0) {
            item.parentElement.insertAdjacentHTML("beforeend", `<div style="margin-left:95% !important;" onmouseover="getVoteCount('${url}')" class="vti-qasim" id="${url}"><img src="${image_embed_src}" width=25 height=25>${html_data}</div>`);
        }

    }
    var sheetDoc = document.createElement("style");

    document.head.appendChild(sheetDoc);
    sheetDoc.sheet.insertRule(".vti-qasim img:hover { cursor:pointer; transform: scale(1.5); }", 0);
    for (var i = 0; i < css_rules.length; i++) {
        sheetDoc.sheet.insertRule(css_rules[i], i + 1);
    }
}


window.onload = () => {

    chrome.storage.sync.get("zen_mode", data => {
        var zen = new ZenSites(document.location.hostname, document.location.pathname, data.zen_mode);
        zen.youtube_custom();
        if(document.location.hostname === "www.youtube.com")
        {
            setInterval(()=>{
                zen = new ZenSites(document.location.hostname, document.location.pathname, data.zen_mode);
                {
                    zen.youtube_custom();    
                }
            }, 1000);
        }
        else
        {
            zen.otherZenContent();
        }

    });

    if (currentTab.getSearchEngine() == 1) //google
    {
        startIndexSearch("LC20lb DKV0Md", 1);
    } else if (currentTab.getSearchEngine() == 0) //duckduckgo
    {
        startIndexSearch("result__title", 0);
    }

};