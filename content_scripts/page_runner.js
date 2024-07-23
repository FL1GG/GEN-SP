(() => {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRunSP) {
      return;
    }
    window.hasRunSP = true;

    /**
     * Listen for messages from the background script.
     * Call "insertBeast()" or "removeExistingBeasts()".
     */
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "aquire-content") {
        console.log("asdfasdfasdf");
        browser.runtime.sendMessage({
            command: "content",
            content: document.getElementsByTagName('html')[0].innerHTML
        });
      }
    });
  })();
  