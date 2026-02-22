// Test Gemini REST API - try v1 instead of v1beta
const apiKey = "AIzaSyB2j_kiVYbqT7kyVSgurzL529pcqSdOm5s";

const payload = {
  contents: [{
    parts: [{
      text: "Hello, what is the capital of France?"
    }]
  }]
};

// Try v1 API
fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.log("Error with gemini-2.0-flash:", data.error.message);

      // Try gemini-pro
      return fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }).then(r => r.json());
    }
    return data;
  })
  .then(data => {
    if (data.error) {
      console.log("❌ Error:", data.error);
    } else {
      console.log("✅ Success!");
      console.log(JSON.stringify(data, null, 2).substring(0, 800));
    }
  })
  .catch(err => console.error("Error:", err.message));
