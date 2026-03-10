const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function evaluateProject(data) {

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Evaluate this startup idea.

Title: ${data.title}
Description: ${data.description}
Stage: ${data.stage}
Tech Stack: ${data.techStack}
Validation: ${data.validation}
Funding Needed: ${data.fundingNeeded}
Team Size: ${data.teamSize}

Return JSON format:

{
execution_score: number (0-30),
innovation_score: number (0-20),
validation_score: number (0-20),
team_score: number (0-10),
funding_readiness: number (0-10),
consistency_score: number (0-10),
total_score: number (0-100),
investor_stage: "idea | prototype | revenue | scalable",
domain: string,
risk_level: "low | medium | high",
feedback: string
}
`;

    const result = await model.generateContent(prompt);

    return result.response.text();
}

module.exports = evaluateProject;