document.getElementById("settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const apiKey = document.getElementById("apiKey").value;
    const apiUrl = document.getElementById("apiUrl").value;
    chrome.storage.local.set({ apiKey, apiUrl }, () => {
      alert("API キーと API URL が保存されました。");
    });
  });
  