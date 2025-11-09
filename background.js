// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Clause extension installed");
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzePDF") {
    // Handle PDF analysis
    sendResponse({ success: true });
    return false; // Synchronous response
  } else if (request.action === "analyzeListing") {
    // Handle Airbnb listing analysis - make request from background script to avoid CORS
    fetch("http://localhost:8000/analyze-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.data),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Check if the port is still open before sending response
        try {
          sendResponse({ success: true, data: data });
        } catch (error) {
          console.error("Failed to send response:", error);
        }
      })
      .catch((err) => {
        console.error("Analysis failed in background:", err);
        // Check if the port is still open before sending error response
        try {
          sendResponse({
            success: false,
            error:
              err.message ||
              "Failed to connect to server. Make sure the server is running on localhost:8000",
          });
        } catch (error) {
          console.error("Failed to send error response:", error);
        }
      });

    // Return true to indicate we will send a response asynchronously
    return true;
  }

  // Return false for unknown actions (synchronous response)
  return false;
});
