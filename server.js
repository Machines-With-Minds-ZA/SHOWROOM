const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow the server to receive JSON from the website.
app.use(express.json({ limit: "20kb" }));

// Make the current project folder publicly available.
// This allows index.html, assets, lib, src and other files to load.
app.use(express.static(path.join(__dirname)));

// Prevent one person from making too many expensive AI requests.
const deepSeekRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI requests. Please wait one minute and try again."
  }
});

/**
 * POST /api/deepseek/chat
 *
 * Receives a message from the website,
 * securely sends it to DeepSeek,
 * and returns DeepSeek's answer.
 */
app.post(
  "/api/deepseek/chat",
  deepSeekRateLimiter,
  async (request, response) => {
    try {
      const message =
        typeof request.body.message === "string"
          ? request.body.message.trim()
          : "";

      const suppliedHistory = Array.isArray(request.body.history)
        ? request.body.history
        : [];

      if (!message) {
        return response.status(400).json({
          error: "Please enter a message."
        });
      }

      if (message.length > 2000) {
        return response.status(400).json({
          error: "Your message is too long. Please keep it below 2,000 characters."
        });
      }

      if (!process.env.DEEPSEEK_API_KEY) {
        console.error("DEEPSEEK_API_KEY is missing from the .env file.");

        return response.status(500).json({
          error: "The AI service has not been configured."
        });
      }

      // Only allow safe user and assistant history.
      // Keep the latest ten messages to control API usage.
      const safeHistory = suppliedHistory
        .filter((item) => {
          return (
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string"
          );
        })
        .slice(-10)
        .map((item) => ({
          role: item.role,
          content: item.content.slice(0, 2000)
        }));

      const deepSeekResponse = await fetch(
        "https://api.deepseek.com/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model:
              process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",

            messages: [
              {
                role: "system",
                content:
                  "You are the GRIT Lab Africa website assistant. " +
                  "Help visitors understand GRIT Lab Africa, its technology projects, " +
                  "gallery, team and contact information. " +
                  "Be professional, friendly and concise. " +
                  "Never invent project details. If you do not know something, " +
                  "tell the visitor to contact info@gritlabafrica.org."
              },
              ...safeHistory,
              {
                role: "user",
                content: message
              }
            ],

            // Disabled makes normal website answers faster and cheaper.
            thinking: {
              type: "disabled"
            },

            stream: false,
            temperature: 0.4,
            max_tokens: 600
          })
        }
      );

      const deepSeekData = await deepSeekResponse.json();

      if (!deepSeekResponse.ok) {
        console.error("DeepSeek API error:", deepSeekData);

        return response.status(502).json({
          error:
            deepSeekData?.error?.message ||
            "DeepSeek could not process the request."
        });
      }

      const reply =
        deepSeekData?.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        return response.status(502).json({
          error: "DeepSeek returned an empty response."
        });
      }

      return response.json({
        reply
      });
    } catch (error) {
      console.error("Server error:", error);

      return response.status(500).json({
        error: "The AI assistant is temporarily unavailable."
      });
    }
  }
);

// Redirect the main address to index.html.
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`GLA website running at http://localhost:${PORT}`);
});