document.addEventListener("DOMContentLoaded", loadResults);


function updateTyposList(lintResult) {
  const typoList = document.getElementById("typoList");
  typoList.innerHTML = "";

  lintResult.messages.forEach((typo) => {
    const li = document.createElement("li");

    // フォーマットに従ってテキストを作成
    let typoText = `${typo.from.line}行目${typo.from.ch}文字目\n※${typo.message}`;
    if (typo.operation === "delete") {
      typoText += `\n「${typo.before}」を「」に`;
    } else if (typo.operation === "replace") {
      typoText += `\n「${typo.before}」を「${typo.after}」に`;
    }
    li.textContent = typoText;
    typoList.appendChild(li);
  });
  saveResults(document.getElementById("statusText").textContent, document.getElementById("sentText").textContent, lintResult);
}


function updateStatus(status) {
  document.getElementById("statusText").textContent = status;
  saveResults(status, document.getElementById("sentText").textContent, null);
}

function updateSentText(text) {
  document.getElementById("sentTextTitle").style.display = "block";
  document.getElementById("sentText").style.display = "block";
  document.getElementById("sentText").textContent = text;
  saveResults(document.getElementById("statusText").textContent, text, null);
}

document.getElementById("execute").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "processArticle" });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateStatus") {
    updateStatus(request.status);
  } else if (request.action === "updateSentText") {
    updateSentText(request.text);
  } else if (request.action === "updateTyposList") {
    updateTyposList(request.typos);
  }
});

function saveResults(status, sentText, typos) {
  const dataToSave = { status, sentText };
  if (typos !== null) {
    dataToSave.typos = typos;
  }
  chrome.storage.local.set(dataToSave);
}

function loadResults() {
  chrome.storage.local.get(["status", "sentText", "typos"], (result) => {
    if (result.status) {
      updateStatus(result.status);
    }
    if (result.sentText) {
      updateSentText(result.sentText);
    }
    if (result.typos) {
      updateTyposList(result.typos);
    }
  });
}

