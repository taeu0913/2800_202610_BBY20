const express = require("express");
const router = express.Router();
const axios = require("axios");
const OpenAI = require("openai");

const client = new OpenAI({

    apiKey: process.env.OPENROUTER_API_KEY,

    baseURL:
        "https://openrouter.ai/api/v1",

    defaultHeaders: {

        "HTTP-Referer":
            "http://localhost:3000",

        "X-Title":
            "ShadeFinder"

    }

});

router.post("/", async (req, res) => {

    try {

        // USER QUESTION
        const { question, lat, lon } = req.body;

        // GET WEATHER DATA
        const weatherURL =
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;

        const weatherResponse =
            await axios.get(weatherURL);

        const weatherData =
            weatherResponse.data;

        console.log(weatherData);

        // EXTRACT WEATHER INFO
        const city = weatherData.name;

        const temperature =
            weatherData.main.temp;

        const condition =
            weatherData.weather[0].description;

        const humidity =
            weatherData.main.humidity;

        const feelsLike =
            weatherData.main.feels_like;

        // GET CURRENT TIME
        const currentTime =
            new Date().toLocaleTimeString();

        // CREATE AI PROMPT
        const prompt = `
You are a smart heat safety assistant for a shade navigation app.

Current conditions:
- Location: ${city}
- Temperature: ${temperature}°C
- Feels like: ${feelsLike}°C
- Weather: ${condition}
- Humidity: ${humidity}%
- Time: ${currentTime}

User question:
"${question}"

Rules:
- Answer ONLY the user's specific question.
- Keep response short (3-4 sentences maximum).
- Do NOT repeat yourself.
- Do NOT mention unrelated advice.
- Be friendly and natural.
- If weather is mild, avoid extreme warnings.
- Do not use bullet points.
`;

        // SEND TO AI
        const completion =
            await client.chat.completions.create({
                model:
                    "openai/gpt-4o-mini",

                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 80,
                temperature: 0.5
            });

        // GET AI RESPONSE
        const answer =
            completion.choices[0].message.content;

        // SEND TO FRONTEND
        res.json({
            answer
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Something went wrong"
        });

    }

});

module.exports = router;