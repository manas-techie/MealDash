const axios = require("axios");

const safeParseModelJson = (content) => {
    const raw = String(content || "").trim();

    try {
        return JSON.parse(raw);
    } catch (_) {
        const firstBrace = raw.indexOf("{");
        const lastBrace = raw.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            throw new Error("AI response did not contain valid JSON");
        }

        const jsonSegment = raw.slice(firstBrace, lastBrace + 1);
        return JSON.parse(jsonSegment);
    }
};

exports.generateDishDescription = async ({
    name,
    category,
    spiceLevel,
    price,
}) => {
    const prompt = `
You are a professional food classification assistant.

Generate ONLY valid JSON.
No markdown.
No explanation text.

IMPORTANT RULES:
- Tags must be accurate restaurant-style tags
- Do NOT misclassify dishes
- Do NOT label main courses as desserts
- Allergens must be realistic
- Serves must be realistic (1 or 2)
- bestFor must be meal timings only

Dish Name: ${name}
Category: ${category}
Spice Level: ${spiceLevel}
Base Price: ${price}

Return JSON in this EXACT format:
{
  "description": "string",
  "tags": ["string"],
  "allergens": ["string"],
  "serves": "string",
  "bestFor": ["string"]
}
`;

    const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            max_tokens: 300,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    return safeParseModelJson(response.data.choices[0].message.content);
};