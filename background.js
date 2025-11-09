// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Clause extension installed');
  });
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzePDF') {
      // Handle PDF analysis
      sendResponse({ success: true });
    }
  });