class Predict {
    constructor() {
        this.hours = [];
        this.gather_data(); //automatically gather data
    }
    gather_data(){
        // collect data into (x:day_number, y:hours_worked) tuple
        let Y = [];
        chrome.storage.sync.get("zen_daily_metrics", zen_data => {
            zen_data = zen_data.zen_daily_metrics;
            if (zen_data && zen_data.timeline) {
                let i = 0;
                Object.keys(zen_data.timeline).map(function (key) {
                    let f = parseFloat(zen_data.timeline[key] / 3600).toPrecision(3);
                    Y.push(parseFloat(f)); //get number of hours
                    i++;
                });
            }
            Y.pop(); //remove today's data for pure prediction
            this.hours = Y;
        });
    }
    get_data()
    {
        return this.hours;
    }
}

const apiURL = "https://vti-api.herokuapp.com/";

/** Gather existing data, if present for (day, hour) */
var regression = new Predict();

class Hash {
    constructor(M, P) {
        this.M = M;
        this.P = P;
    }

    /**
     * Converts a string into an integer hash value
     * @param {String} data data to convert the hash value for (string)
     * @returns {Integer} returns an Int of the corresponding hash value for the string (data)
     */
    get_str_hash(data) {
        data = String(data);
        var hash_Int = 0;
        for (var i = data.length - 1; i >= 0; i--) {
            hash_Int += (hash_Int * this.X + data.charCodeAt(i)) % this.P;

        }
        return parseInt(hash_Int);
    }
    /**
     * Sets the index multiplication for primal value for str hash function.
     * Need to do this before calling {get_str_hash}
     * @param {Integer} X the primal function for string based hash function
     */
    setPrimeString(X) {
        this.X = X;
    }
}

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
}

class Vote {
    constructor(hostname, session_data, voteType) {
        this.voteType = voteType;
        this.hostname = hostname;
        this.session_data = session_data;
    }
    hasVoted() {
        return this.voteType != -1;
    }
    isDownvote() {
        return this.voteType == 0;
    }
    isUpvote() {
        return this.voteType == 1;
    }
    sendUpvote() {
        if (!this.hasVoted()) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    const data = JSON.parse(xmlhttp.responseText);
                    let code = data.code;
                    if (code === 200) //data exists
                    {
                        document.getElementById("hostUpvotes").innerText = data.data.host.upvotes;
                        document.getElementById("upvoteCount").innerText = data.data.path.upvotes;
                        this.session_data.push({"url" : data.data.path.url, "voteType" : 1});
                        
                        chrome.storage.sync.set({'vti_sessions': this.session_data}, ()=>{
                            //alert user
                            this.voteType = 1;
                            this.refurbishContent();

                        }); //upvote = 1;
                    }
                    else {
                        document.getElementById("hostUpvotes").innerText = "ERROR";
                        document.getElementById("upvoteCount").innerText = "ERROR";
                    }
                }
            };
            xmlhttp.open("POST", apiURL + "upvote?q=" + this.hostname, true);
            xmlhttp.send();
        }
    }

    sendDownvote() {
        if (!this.hasVoted()) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    const data = JSON.parse(xmlhttp.responseText);
                    let code = data.code;
                    if (code === 200) //data exists
                    {
                        document.getElementById("hostDownvotes").innerText = data.data.host.downvotes;
                        document.getElementById("downvoteCount").innerText = data.data.path.downvotes;
                        
                        this.session_data.push({"url" : data.data.path.url, "voteType" : 0});

                        chrome.storage.sync.set({'vti_sessions': this.session_data}, ()=>{
                            //alert user of vote
                            this.voteType = 0;
                            this.refurbishContent();
                        }); //downvote = 0
                    }
                    else {
                        document.getElementById("downvoteCount").innerText = "ERROR";
                        document.getElementById("hostDownvotes").innerText = "ERROR";
                    }
                }
            };
            xmlhttp.open("POST", apiURL + "downvote?q=" + this.hostname, true);
            xmlhttp.send();
        }
    }

    refurbishContent()
    {
        if(this.voteType == 1) //upvote
        {
            document.getElementById("choices").style.display = "none";
            document.getElementById("displayResults").style.display = "inline-block";
            document.getElementById("displayResults").innerHTML = `<div style="margin:10px !important; text-transform:uppercase; letter-spacing:1px; word-spacing:2px;" class="ui center aligned small green header">This page has been upvoted</div><br>`;
        }
        else if(this.voteType == 0) //downvote
        {
            document.getElementById("choices").style.display = "none";
            document.getElementById("displayResults").style.display = "inline-block";
            document.getElementById("displayResults").innerHTML = `<div style="margin:10px !important; text-transform:uppercase; letter-spacing:1px; word-spacing:2px;" class="ui center aligned small red header">This page has been downvoted</div><br>`;
        }
    }

}


var defaultCount = () => {
    document.getElementById("upvoteCount").innerText = 0;
    document.getElementById("downvoteCount").innerText = 0;
    document.getElementById("hostDownvotes").innerText = 0;
    document.getElementById("hostUpvotes").innerText = 0;
};

function useToken() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabArray) {
        const url = tabArray[0].url;
        let url_polished = getLocation(url).hostname;

        if (getLocation(url).pathname.length > 1) {
            url_polished += getLocation(url).pathname;
        }
    
        /**
         * Hash Class Invocation
         */
        const hash = new Hash(10000019, 1000);
        hash.setPrimeString(31);
        const current_hash_URL = hash.get_str_hash(url_polished);
        var voteType = -1,
            session_data = [];

        chrome.storage.sync.get('vti_sessions', data => {
            data = data.vti_sessions;
            if (data && data.length > 0) {
                session_data = data;
                for(let i = 0; i < data.length; i++)
                {
                    let item = data[i];
                    if (item.url == current_hash_URL) {
                        voteType = item.voteType;
                        break;
                    }
                }
            }
            
            /**
             * Main function
             */
            
            /**
             * Get Predicted number of hours of flow for today.
             */
            predict_hours();
            const searchClass = new SearchEngine(url_polished),
                launchVote = new Vote(searchClass.hostname, session_data, voteType);

            if(voteType == -1)
            {
                document.getElementById("upvote").onclick = () => {
                    if (!launchVote.hasVoted()) {
                        launchVote.sendUpvote();
                    }
                }
    
                document.getElementById("downvote").onclick = () => {
                    if (!launchVote.hasVoted()) {
                        launchVote.sendDownvote();
                    }
                }
            }
            else
            {
                launchVote.refurbishContent();
            }
            
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = () => {

                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    const data = JSON.parse(xmlhttp.responseText);
                    let code = data.code;
                    if (code === 200) //data exists
                    {
                        document.getElementById("hostUpvotes").innerText = data.data.host.upvotes;
                        document.getElementById("hostDownvotes").innerText = data.data.host.downvotes;

                        document.getElementById("upvoteCount").innerText = data.data.path.upvotes;
                        document.getElementById("downvoteCount").innerText = data.data.path.downvotes;

                    }
                    else {
                        defaultCount();
                    }
                }
            };
            xmlhttp.open("GET", apiURL + "stats?q=" + searchClass.getHostname(), true);
            xmlhttp.send();
        });
    });
}

useToken();

/**
 * DANGER : Use only when clearing ENTIRE Chrome session data
 */
function clearSyncStorage() {
    chrome.storage.sync.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    })
}

var getLocation = function (href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};


/**
 * Focus Mode
 */
var intervalID; //interval ID for Timer

//load initial condition
chrome.storage.sync.get("zen_mode", mode=>{
    chrome.storage.sync.get("zen_timer", timer=>{
        if(mode.zen_mode)
        {
            document.getElementById("zen_switch").checked = true;
            startTimer(timer.zen_timer);
        }
        else
        {
            deltaConversion(timer.zen_timer, false);
            chrome.storage.sync.get("zen_daily_metrics", zen_daily_metrics=>{
                zen_daily_metrics = zen_daily_metrics.zen_daily_metrics;
                var today = new Date();
                    today = ("0" + (today.getMonth() + 1).toString()).slice(-2) + "-" + ("0" + today.getDate().toString()).slice(-2) + "-" + today.getFullYear().toString();
                if(zen_daily_metrics && zen_daily_metrics.timeline && zen_daily_metrics.timeline[today])
                {
                    tally_UI(parseInt(zen_daily_metrics.timeline[today]));
                }
            });
        }
        
    });
});



//on-click listener
document.getElementById("zen_switch").onclick = (event)=>{
    chrome.storage.sync.set({"zen_mode" : event.target.checked}, ()=>{
        console.log("Zen Mode set to: ", event.target.checked);
        if(event.target.checked) //sets timer
        {
            const A = Math.floor(Date.now()/1000);
            chrome.storage.sync.set({"zen_timer" : A}, ()=>{
                console.log("Timer Logged.");
                startTimer(A);
            });
        }
        else
        {
            var nowTime = Math.floor(Date.now()/1000);
            chrome.storage.sync.get("zen_timer", data=>{
                chrome.storage.sync.set({"zen_timer": nowTime - data.zen_timer}, ()=>{
                    deltaConversion(nowTime - data.zen_timer, false);

                     /**
                      * Daily Metrics
                      */
                    daily_metric_generation(nowTime, data.zen_timer); //tallies up daily metrics for analytics

                });
            }); 
            clearInterval(intervalID);
        }
    });
}

//Start Timer
var startTimer = (time)=>{
    /**
     * HIDING Analytics Pool in Zen Mode
    */
    document.getElementsByClassName("elevate")[0].style.display = "none";
    document.getElementsByClassName("elevate")[1].style.display = "none";
    deltaConversion(time, true);
    intervalID = window.setInterval(deltaConversion, 1000, time, true);
}

//Helper for Timer
var deltaConversion = (time, isWatchdogOn)=>{
    var nowTime = Math.floor(Date.now()/1000);
    var delta = nowTime - time;
    if(isWatchdogOn)
    {
        document.getElementById("hour").innerText = ("0" + Math.floor(delta/3600)).slice(-2);
        document.getElementById("minute").innerText = ("0" + Math.floor(delta/60)%60).slice(-2);
        document.getElementById("second").innerText = ("0" + delta%60).slice(-2);
        document.getElementById("hour").style.color = "#000";
        document.getElementById("minute").style.color = "#000";
        document.getElementById("second").style.color = "#000";
    }
    else
    {
        document.getElementById("hour").innerText = ("0" + Math.floor(time/3600)).slice(-2);
        document.getElementById("minute").innerText = ("0" + Math.floor(time/60)%60).slice(-2);
        document.getElementById("second").innerText = ("0" + time%60).slice(-2);
        document.getElementById("hour").style.color = "#db2828";
        document.getElementById("minute").style.color = "#db2828";
        document.getElementById("second").style.color = "#db2828";
    }
    
}

//Accumulator
var daily_metric_generation = (nowTime, endZenTime)=>{
    //Zen mode accumulator and analytics dashboard (part 1)
    var today = new Date();
    today = ("0" + (today.getMonth() + 1).toString()).slice(-2) + "-" + ("0" + today.getDate().toString()).slice(-2) + "-" + today.getFullYear().toString();

    chrome.storage.sync.get("zen_daily_metrics", zen_metrics=>{
        zen_metrics = zen_metrics.zen_daily_metrics;
        
        console.debug(zen_metrics);

        if(zen_metrics && zen_metrics.timeline)
        {
            let today_metrics = zen_metrics.timeline[today];
            if(today_metrics)
            {
                today_metrics += parseInt(nowTime - endZenTime);
            }
            else
            {
                today_metrics = parseInt(nowTime - endZenTime);
            }
            zen_metrics.timeline[today] = today_metrics;
        }
        else
        {
            let struct = {
                timeline : {}
            }
            struct.timeline[today] = parseInt(nowTime - endZenTime);
            zen_metrics = struct;
        }
        chrome.storage.sync.set({"zen_daily_metrics": zen_metrics}, ()=>{
            console.debug("Timeline updated. Daily zen time in #seconds:: ", zen_metrics.timeline[today]);
            tally_UI(zen_metrics.timeline[today]);
        });
    });
}

//UI display for Daily tally
var tally_UI = (time) => {
    /**
    * DISPLAYING Analytics Pool in Zen Mode
    */
    document.getElementsByClassName("elevate")[0].style.display = "";
    document.getElementsByClassName("elevate")[1].style.display = "";
    document.getElementById("hour_daily").innerText = ("0" + Math.floor(time / 3600)).slice(-2);
    document.getElementById("minute_daily").innerText = ("0" + Math.floor(time / 60) % 60).slice(-2);
    document.getElementById("second_daily").innerText = ("0" + time % 60).slice(-2);
}

/**
 * Get predicted number of hours worked for today
 * based on past history.
 */

var predict_hours = () => {

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {

        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const data = JSON.parse(xmlhttp.responseText);
            console.log(data);
            let code = data.code;
            if (code === 200) //data exists
            {
                console.log(data);
                document.getElementById('flow').dataset.tooltip = "Predicted flow hours: " + data.data;
            }
            else
            {
                document.getElementById('flow').dataset.tooltip = "Time spent today in Zen mode";
            }
        }
    };
    xmlhttp.open("GET", apiURL + "predict?data=[" + regression.get_data() + "]", true);
    xmlhttp.send();
}