function updateTyposList(typos) {
  const typoList = document.getElementById("typoList");
  typoList.innerHTML = "";

  if (typos.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No typos detected";
    typoList.appendChild(li);
  } else {
    typos.forEach((typo) => {
      const li = document.createElement("li");
      li.textContent = `Line ${typo.line}: ${typo.before} => ${typo.after}`;
      typoList.appendChild(li);
    });
  }
}

function updateStatus(status) {
  document.getElementById("statusText").textContent = status;
}

function updateSentText(text) {
  document.getElementById("sentTextTitle").style.display = "block";
  document.getElementById("sentText").style.display = "block";
  document.getElementById("sentText").textContent = text;
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
