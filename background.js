chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchShodoAPI") {
    const headers = new Headers(request.headers);
    fetch(request.url, {
      method: request.method,
      headers: headers,
      body: request.body && JSON.stringify(request.body),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch");
        }
      })
      .then((data) => sendResponse(data))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }
});
