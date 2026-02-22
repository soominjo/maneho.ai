// Test RAG endpoint - simple non-batched format
const query = "What are the traffic violation penalties in the Philippines?";

fetch("http://localhost:3001/trpc/rag.askLawyer", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ query })
})
  .then(r => r.json())
  .then(data => {
    console.log("✅ Response received:");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error("❌ Error:", err.message));
