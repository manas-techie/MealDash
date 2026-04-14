const axios = require("axios");

const normalizeReviewRows = (reviews = []) => {
    return reviews
        .filter((review) => review && review.comment)
        .slice(0, 40)
        .map((review, index) => {
            const rating = Number(review.rating || 0).toFixed(1);
            const comment = String(review.comment || "").replace(/\s+/g, " ").trim();
            return `${index + 1}. rating=${rating}/5, comment="${comment}"`;
        });
};

exports.generateReviewSummary = async ({
    entityType,
    entityName,
    averageRating,
    totalReviews,
    reviews,
}) => {
    const reviewRows = normalizeReviewRows(reviews);

    const prompt = `
You are an e-commerce review analyst.

Write a concise, neutral, Amazon-style review summary for a ${entityType}.

Rules:
- Output plain text only.
- No markdown or headings.
- 3 to 4 sentences.
- Mention top positives and common issues if present.
- Keep tone factual, not promotional.
- Do not invent details not present in reviews.

Subject: ${entityName}
Average Rating: ${Number(averageRating || 0).toFixed(1)} / 5
Total Reviews: ${Number(totalReviews || 0)}

Reviews:
${reviewRows.join("\n")}
`;

    const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 220,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    return String(response?.data?.choices?.[0]?.message?.content || "")
        .replace(/\s+/g, " ")
        .trim();
};
