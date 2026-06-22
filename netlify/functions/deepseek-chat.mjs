function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export default async function handler(request) {
  try {
    if (request.method !== "POST") {
      return jsonResponse(
        {
          error: "Method not allowed."
        },
        405
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is missing.");

      return jsonResponse(
        {
          error:
            "The OpenRouter API key is missing from Netlify."
        },
        500
      );
    }

    let requestBody;

    try {
      requestBody = await request.json();
    } catch {
      return jsonResponse(
        {
          error: "The request contained invalid JSON."
        },
        400
      );
    }

    const message =
      typeof requestBody.message === "string"
        ? requestBody.message.trim()
        : "";

    const suppliedHistory = Array.isArray(
      requestBody.history
    )
      ? requestBody.history
      : [];

    if (!message) {
      return jsonResponse(
        {
          error: "Please enter a message."
        },
        400
      );
    }

    if (message.length > 2000) {
      return jsonResponse(
        {
          error:
            "Your message is too long. Please use fewer than 2,000 characters."
        },
        400
      );
    }

    const safeHistory = suppliedHistory
      .filter((item) => {
        return (
          item &&
          (item.role === "user" ||
            item.role === "assistant") &&
          typeof item.content === "string"
        );
      })
      .slice(-10)
      .map((item) => {
        return {
          role: item.role,
          content: item.content.slice(0, 2000)
        };
      });

    const model =
      process.env.OPENROUTER_MODEL ||
      "openrouter/free";

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.URL ||
            request.headers.get("origin") ||
            "https://localhost",
          "X-OpenRouter-Title":
            "GRIT Lab Africa Assistant"
        },

        body: JSON.stringify({
          model,

          messages: [
            {
              role: "system",
              content:
                "You are the official GRIT Lab Africa website assistant. " +
                "Help visitors understand GRIT Lab Africa, its projects, " +
                "gallery, team and contact information. " +
                "Keep your answers helpful, friendly and professional. " +
                "Do not invent information. If the requested information " +
                "is unavailable, advise the visitor to contact " +
                "info@gritlabafrica.org."
            },

            ...safeHistory,

            {
              role: "user",
              content: message
            }
          ],

          temperature: 0.4,
          max_tokens: 600,
          stream: false
        })
      }
    );

    const openRouterData =
      await openRouterResponse.json().catch(() => {
        return {};
      });

    if (!openRouterResponse.ok) {
      console.error(
        "OpenRouter error:",
        JSON.stringify(openRouterData)
      );

      return jsonResponse(
        {
          error:
            openRouterData?.error?.message ||
            `OpenRouter returned error ${openRouterResponse.status}.`
        },
        openRouterResponse.status
      );
    }

    const reply =
      openRouterData?.choices?.[0]?.message?.content;

    if (
      typeof reply !== "string" ||
      !reply.trim()
    ) {
      return jsonResponse(
        {
          error:
            "The AI service returned an empty response."
        },
        502
      );
    }

    return jsonResponse({
      reply: reply.trim()
    });
  } catch (error) {
    console.error("Netlify Function error:", error);

    return jsonResponse(
      {
        error:
          "The AI assistant is temporarily unavailable."
      },
      500
    );
  }
}

export const config = {
  path: "/api/deepseek/chat"
};