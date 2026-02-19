const BACKEND_URL = "http://localhost:5000/analyze";

async function analyze() {
    const input = document.getElementById("dataInput").value;
    const resultDiv = document.getElementById("result");

    try {
        const transactions = JSON.parse(input);

        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions })
        });

        const data = await response.json();

        resultDiv.innerHTML = `
            <h3>Suspicious Accounts:</h3>
            <p>${data.suspiciousAccounts.join(", ")}</p>

            <h3>Detected Patterns:</h3>
            <pre>${JSON.stringify(data.detectedPatterns, null, 2)}</pre>
        `;

    } catch (err) {
        resultDiv.innerHTML = "Invalid JSON format!";
    }
}
