
const OpenAI = require("openai");

async function testConnection() {
    const SPACE_URL = "https://makitodev-makito.hf.space";
    const HF_TOKEN = process.env.HF_ACCESS_TOKEN || "YOUR_HF_TOKEN";

    console.log("Testing OpenAI-compatible connection to:", SPACE_URL);

    const client = new OpenAI({
        baseURL: SPACE_URL + "/v1",
        apiKey: HF_TOKEN
    });

    // 1. Try to list models to see what the server expects
    try {
        console.log("Fetching /v1/models...");
        const models = await client.models.list();
        console.log("Available Models:", models.data.map(m => m.id));

        // Use the first available model
        const modelName = models.data[0]?.id || "default";
        console.log("Using model:", modelName);

        const response = await client.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: "Hello!" }],
            max_tokens: 50
        });
        console.log("SUCCESS!");
        console.log("Response:", response.choices[0].message.content);
        return;

    } catch (e) {
        console.error("List Models Failed:", e.message);
    }

    // 2. If listing fails, try guessing common names
    const commonNames = ["Qwen/Qwen2.5-Coder-7B-Instruct", "default", "gpt-3.5-turbo"];

    for (const name of commonNames) {
        try {
            console.log(`Trying model name: "${name}"...`);
            const response = await client.chat.completions.create({
                model: name,
                messages: [{ role: "user", content: "Hello!" }],
                max_tokens: 50
            });
            console.log("SUCCESS!");
            console.log(response.choices[0].message.content);
            return;
        } catch (e) {
            console.log(`Failed with "${name}":`, e.message);
        }
    }
}

testConnection();
