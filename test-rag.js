// Test RAG endpoint
const query = "What are the traffic violation penalties in the Philippines?";

const payload = [{
  "0": {
    "jsonrpc": "2.0",
    "id": "1",
    "method": "mutation",
    "params": {
      "path": "rag.askLawyer",
      "input": { "query": query }
    }
  }
}];

fetch("http://localhost:3001/trpc", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
  .then(r => r.json())
  .then(data => {
    console.log("Response received:");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error("Error:", err));
