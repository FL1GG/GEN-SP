
/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
    browser.runtime.onMessage.addListener((message) => {
    
        if (message.command === "content") {
            //document.getElementById("content-area").innerHTML = message.content

            let contents = message.content;

            var wrapper = document.createElement('html');
            wrapper.innerHTML = contents

            var data = wrapper.getElementsByTagName("body")[0].innerText
            var words = data.trim().split(/\s+/g)

            let map = new Map();

            words.forEach((word) => {
                word = word.replace(/[^0-9a-z]/gi, '').toLowerCase();
                if(word != "") {
                
                    if(map.has(word)) {
                        map.set(word, map.get(word)+1);
                    } else {
                        map.set(word, 1);
                    }
                }
            })

            // could definetly be better 
            const sortedMap = Array.from(map).sort((a, b) => b[1] - a[1]);

            out = "";
            sortedMap.forEach((element) => {
                if(element[1] >= parseInt(document.getElementById('min-counts').value, 10)) {
                    if(out === "") {
                        out = element[0]
                    } else { 
                        out = out + '\n' + element[0]
                    }
    
                    if(document.getElementById("show-count").checked) {
                        out = out + ', ' + element[1]
                    }
                }                
            })

            document.getElementById("content-area").innerHTML = out;
        }
    });

    document.addEventListener("click", (e) => {

        /**
        * Insert the page-hiding CSS into the active tab,
        * then get the beast URL and
        * send a "beastify" message to the content script in the active tab.
        */
        function beastify(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "aquire-content",
            });
        }

        /**
        * Just log the error to the console.
        */
        function reportError(error) {
            console.error(`Could not beastify: ${error}`);
        }

        /**
        * Get the active tab,
        * then call "beastify()" or "reset()" as appropriate.
        */
        if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
            // Ignore when click is not on a button within <div id="popup-content">.
            return;
        }
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(beastify)
            .catch(reportError);
    });
}

/**
* There was an error executing the script.
* Display the popup's error message, and hide the normal UI.
*/
function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
* When the popup loads, inject a content script into the active tab,
* and add a click handler.
* If we couldn't inject the script, handle the error.
*/
browser.tabs
    .executeScript({ file: "/content_scripts/page_runner.js" })
    .then(listenForClicks)
    .catch(reportExecuteScriptError);
