const apiURL = "https://vti-api.herokuapp.com/";

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
                        
                        chrome.storage.sync.set({'vti_session': this.session_data}, ()=>{
                            console.log(this.session_data, "UPvote successful");
                            this.voteType = 1;

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
                            console.log(this.session_data, "Downvote successful");
                            this.voteType = 0;

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
                for(let i = 0; i < data.length; i++)
                {
                    let item = data[i];
                    console.log(item);
                    if (item && item.url == current_hash_URL) {
                        voteType = item.voteType;
                        break;
                    }
                }
            }
            
            /**
             * Main function
             */
            const searchClass = new SearchEngine(url_polished),
                launchVote = new Vote(searchClass.hostname, session_data, voteType);

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
            xmlhttp.open("GET", apiURL + "stats?q=" + searchClass.hostname, true);
            xmlhttp.send();
        });
    });
}

useToken();


var getLocation = function (href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};
