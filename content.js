// Detect if current page is a PDF
function isPDFPage() {
    return document.contentType === 'application/pdf' || 
           window.location.pathname.toLowerCase().endsWith('.pdf');
  }
  
  // Detect if on Airbnb listing page
  function isAirbnbListing() {
    return window.location.hostname.includes('airbnb.com') && 
           window.location.pathname.includes('/rooms/');
  }
  
  // Create floating scan button
  function createScanButton(type) {
    // Remove existing button if present
    const existing = document.getElementById('clause-scan-btn');
    if (existing) existing.remove();
  
    const button = document.createElement('div');
    button.id = 'clause-scan-btn';
    button.className = 'clause-floating-button';
    
    if (type === 'pdf') {
      button.innerHTML = `
        <div class="clause-btn-content">
          <span class="clause-icon">⚖️</span>
          <span class="clause-text">Scan PDF for Illegal Clauses?</span>
        </div>
      `;
    } else if (type === 'airbnb') {
      button.innerHTML = `
        <div class="clause-btn-content">
          <span class="clause-icon">🔍</span>
          <span class="clause-text">Check Listing Rules</span>
        </div>
      `;
    }
  
    button.addEventListener('click', () => handleScan(type));
    document.body.appendChild(button);
  }
  
  // Handle scan action
  function handleScan(type) {
    if (type === 'pdf') {
      // Get PDF URL and redirect to main app
      const pdfUrl = encodeURIComponent(window.location.href);
      window.location.href = `http://localhost:3000`;
    } else if (type === 'airbnb') {
      // Extract listing data and analyze
      analyzeListing();
    }
  }
  
  // Analyze Airbnb listing (hardcoded for demo)
  function analyzeListing() {
    // Show loading state with spinner
    const button = document.getElementById('clause-scan-btn');
    button.innerHTML = `
      <div class="clause-btn-content">
        <div class="clause-spinner"></div>
        <span class="clause-text">Analyzing...</span>
      </div>
    `;

    // Hardcoded demo data (replace with actual scraping later)
    const mockListingData = {
      listing_id: window.location.pathname.split('/rooms/')[1],
      title: document.querySelector('h1')?.textContent || 'Listing',
      house_rules: [
        "No refunds within 7 days of check-in",
        "Guest responsible for all damages, security deposit non-refundable",
        "Must pay $200 cleaning fee in cash upon arrival"
      ]
    };

    // Track when the request started
    const startTime = Date.now();
    const minLoadingTime = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000; // Random between 3-5 seconds

    // Send to your API
    fetch('http://localhost:3000/analyze-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockListingData)
    })
    .then(res => res.json())
    .then(data => {
      // Calculate remaining time to reach 3 seconds
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      // Wait for the remaining time before showing results
      setTimeout(() => {
        showResults(data);
      }, remainingTime);
    })
    .catch(err => {
      console.error('Analysis failed:', err);
      // Calculate remaining time even for errors
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      setTimeout(() => {
        button.innerHTML = '<div class="clause-btn-content"><span class="clause-text">❌ Error</span></div>';
      }, remainingTime);
    });
  }
  
  // Show analysis results in sidebar
  function showResults(data) {
    const button = document.getElementById('clause-scan-btn');
    button.remove();
  
    const sidebar = document.createElement('div');
    sidebar.id = 'clause-sidebar';
    sidebar.className = 'clause-sidebar';
    sidebar.innerHTML = `
      <div class="clause-sidebar-header">
        <h3>⚖️ Clause Analysis</h3>
        <button id="clause-close-btn">×</button>
      </div>
      <div class="clause-sidebar-content">
        <div class="clause-risk-score ${data.risk_level}">
          Risk Score: ${data.risk_score}/100
        </div>
        <h4>Violations Found:</h4>
        ${data.violations.map(v => `
          <div class="clause-violation ${v.severity}">
            <div class="violation-title">${v.title}</div>
            <div class="violation-description">${v.description}</div>
            <div class="violation-law">Violates: ${v.law}</div>
          </div>
        `).join('')}
        <button class="clause-full-report-btn" id="clause-full-report">
          View Full Report
        </button>
      </div>
    `;
  
    document.body.appendChild(sidebar);
  
    // Close button
    document.getElementById('clause-close-btn').addEventListener('click', () => {
      sidebar.remove();
      createScanButton('airbnb'); // Restore scan button
    });
  
    // Full report button
    document.getElementById('clause-full-report').addEventListener('click', () => {
      window.open('http://localhost:3000/report?listing=' + data.listing_id, '_blank');
    });
  }
  
  // Initialize on page load
  if (isPDFPage()) {
    createScanButton('pdf');
  } else if (isAirbnbListing()) {
    createScanButton('airbnb');
  }