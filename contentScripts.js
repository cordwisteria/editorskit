async function getCredentials() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiUrl", "apiKey"], (result) => {
      resolve(result);
    });
  });
}

async function fetchShodoAPI(request) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(request, (response) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
}

async function getLintId(text) {
  const { apiUrl, apiKey } = await getCredentials();
  const response = await fetchShodoAPI({
    action: "fetchShodoAPI",
    url: apiUrl,
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: { body: text },
  });

  return response.lint_id;
}


async function fetchLintResult(lintId) {
  const { apiUrl, apiKey } = await getCredentials();
  const apiUrlWithLintId = `${apiUrl}${lintId}/`;

  const response = await fetchShodoAPI({
    action: "fetchShodoAPI",
    url: apiUrlWithLintId,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  return response;
}

async function detectTypos(text) {
  updatePopupStatus("FetchingLintId...");
  const lintId = await getLintId(text);
  updatePopupStatus("FetchingLintResult...");
  let lintResult = await fetchLintResult(lintId);

  while (lintResult.status === "processing") {
    await new Promise(r => setTimeout(r, 1000));
    lintResult = await fetchLintResult(lintId);
  }

  if (lintResult.status === "done") {
    // 生のJSONデータを返すように変更
    return lintResult;
  } else {
    throw new Error("Failed to get lint result");
  }
}

function sendTyposToPopup(typos) {
  chrome.runtime.sendMessage({ action: "updateTyposList", typos: typos });
}

function updatePopupStatus(status) {
  chrome.runtime.sendMessage({ action: "updateStatus", status: status });
}

function updatePopupSentText(text) {
  chrome.runtime.sendMessage({ action: "updateSentText", text: text });
}

async function processArticles() {
  const articles = document.querySelectorAll("p");
  if (articles.length > 0) {
    updatePopupStatus("Processing...");

    // 全ての記事のテキストを結合
    const combinedText = Array.from(articles).map(article => article.outerText).join("\n");

    updatePopupSentText(combinedText);
    try {
      updatePopupStatus("DetectingTypos...");
      const detectedTypos = await detectTypos(combinedText);
      sendTyposToPopup(detectedTypos);
      updatePopupStatus("Done");
    } catch (error) {
      updatePopupStatus("Error: " + error.message);
    }
  } else {
    updatePopupStatus("No article found");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processArticle") {
    processArticles();
  }
});
