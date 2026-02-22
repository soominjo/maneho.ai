// Test Gemini API directly
const apiKey = "AIzaSyB2j_kiVYbqT7kyVSgurzL529pcqSdOm5s";

const payload = {
  contents: [{
    parts: [{
      text: "Hello, what is the capital of France?"
    }]
  }]
};

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.log("❌ Error:", data.error);
    } else {
      console.log("✅ Success!");
      console.log(JSON.stringify(data, null, 2).substring(0, 500));
    }
  })
  .catch(err => console.error("Error:", err.message));
