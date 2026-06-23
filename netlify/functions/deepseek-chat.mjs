const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 10;

function createJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function cleanHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => {
      return (
        item &&
        (item.role === "user" ||
          item.role === "assistant") &&
        typeof item.content === "string"
      );
    })
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(
        0,
        MAX_MESSAGE_LENGTH
      )
    }));
}

function getDeepSeekError(status, responseData) {
  const providerMessage =
    responseData?.error?.message;

  switch (status) {
    case 400:
      return (
        providerMessage ||
        "DeepSeek rejected the request format."
      );

    case 401:
      return (
        "The DeepSeek API key is invalid. " +
        "Check the DEEPSEEK_API_KEY variable in Netlify."
      );

    case 402:
      return (
        "The DeepSeek account has insufficient balance. " +
        "Add API credit to the DeepSeek account."
      );

    case 429:
      return (
        "The AI service is receiving too many requests. " +
        "Please wait and try again."
      );

    case 500:
    case 502:
    case 503:
      return (
        "DeepSeek is temporarily unavailable. " +
        "Please try again shortly."
      );

    default:
      return (
        providerMessage ||
        `DeepSeek returned error ${status}.`
      );
  }
}

export default async function handler(request) {
  /*
   * Opening /api/deepseek/chat in a browser sends a GET request.
   * This response confirms that the function was deployed.
   */
  if (request.method === "GET") {
    return createJsonResponse({
      ok: true,
      service: "GRIT Lab Africa DeepSeek chatbot",
      configured: Boolean(
        process.env.DEEPSEEK_API_KEY
      )
    });
  }

  if (request.method !== "POST") {
    return createJsonResponse(
      {
        error: "Method not allowed."
      },
      405
    );
  }

  const apiKey =
    process.env.DEEPSEEK_API_KEY;

  const model =
    process.env.DEEPSEEK_MODEL ||
    "deepseek-v4-flash";

  if (!apiKey) {
    console.error(
      "DEEPSEEK_API_KEY is missing from Netlify."
    );

    return createJsonResponse(
      {
        error:
          "The AI service has not been configured."
      },
      500
    );
  }

  let requestBody;

  try {
    requestBody = await request.json();
  } catch {
    return createJsonResponse(
      {
        error:
          "The chatbot sent an invalid request."
      },
      400
    );
  }

  const message =
    typeof requestBody.message === "string"
      ? requestBody.message.trim()
      : "";

  if (!message) {
    return createJsonResponse(
      {
        error: "Please enter a message."
      },
      400
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return createJsonResponse(
      {
        error:
          "Your message must be shorter than 2,000 characters."
      },
      400
    );
  }

  const history = cleanHistory(
    requestBody.history
  );

  const pageTitle =
    typeof requestBody.pageTitle === "string"
      ? requestBody.pageTitle.slice(0, 200)
      : "";

  const pagePath =
    typeof requestBody.pagePath === "string"
      ? requestBody.pagePath.slice(0, 200)
      : "";

  const messages = [
    {
      role: "system",
      content:
        "You are the official GRIT Lab Africa website assistant. " +
        "Help visitors understand GRIT Lab Africa, its projects, " +
        "gallery, team, videos and contact information. " +
        "Use a friendly, professional and concise tone. " +
        "Do not invent project details, people, contact details or facts. " +
        "When information is unavailable, clearly say that you do not " +
        "have that information and advise the visitor to contact " +
        "info@gritlabafrica.org. " +
        `The visitor is currently viewing the page titled "${pageTitle}" ` +
        `at the path "${pagePath}".`
    },

    ...history,

    {
      role: "user",
      content: message
    }
  ];

  try {
    const deepSeekResponse = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model,
          messages,

          thinking: {
            type: "disabled"
          },

          temperature: 0.4,
          max_tokens: 600,
          stream: false
        })
      }
    );

    const responseData =
      await deepSeekResponse
        .json()
        .catch(() => {
          return {};
        });

    if (!deepSeekResponse.ok) {
      console.error(
        "DeepSeek API error:",
        deepSeekResponse.status,
        JSON.stringify(responseData)
      );

      return createJsonResponse(
        {
          error: getDeepSeekError(
            deepSeekResponse.status,
            responseData
          )
        },
        deepSeekResponse.status
      );
    }

    const reply =
      responseData?.choices?.[0]?.message?.content;

    if (
      typeof reply !== "string" ||
      !reply.trim()
    ) {
      console.error(
        "DeepSeek returned no message content:",
        JSON.stringify(responseData)
      );

      return createJsonResponse(
        {
          error:
            "The AI service returned an empty response."
        },
        502
      );
    }

    return createJsonResponse({
      reply: reply.trim(),
      model:
        responseData.model ||
        model
    });
  } catch (error) {
    console.error(
      "Netlify chatbot function failed:",
      error
    );

    return createJsonResponse(
      {
        error:
          "The AI assistant is temporarily unavailable."
      },
      500
    );
  }
}

/*
 * This makes the function available at:
 *
 * https://your-site.netlify.app/api/deepseek/chat
 */
export const config = {
  path: "/api/deepseek/chat"
};