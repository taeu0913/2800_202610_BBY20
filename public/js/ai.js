async function askAI() {

    const question =
        document.getElementById("aiQuestion").value;

    if (!question) {
        alert("Please enter a question.");
        return;
    }

    document.getElementById("aiResponseContainer").innerHTML =
        `<div class="ai-response-card">Thinking...</div>`;

    navigator.geolocation.getCurrentPosition(async (position) => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
            const response = await fetch("/api/ask-ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question,
                    lat,
                    lon
                })
            });

            const data = await response.json();

            document.getElementById("aiResponseContainer").innerHTML = `
                <div class="ai-response-card">
                    ${data.answer}
                </div>
            `;

        } catch (error) {
            console.log(error);

            document.getElementById("aiResponseContainer").innerHTML =
                `<div class="ai-response-card">Failed to get response</div>`;
        }

    });

}

function clearChat() {
    document.getElementById("aiResponseContainer").innerHTML = "";
    document.getElementById("aiQuestion").value = "";
}