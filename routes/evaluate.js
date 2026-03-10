const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const evaluateProject = require("../services/geminiService");
const { evaluateSchema, validate } = require("../middleware/validate");

router.post("/", validate(evaluateSchema), async (req, res) => {

    try {

        const aiResponse = await evaluateProject(req.body);

        let parsed;
        try {
            // Remove markdown formatting from Gemini response if present
            const cleanResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
            parsed = JSON.parse(cleanResponse);
        } catch (parseError) {
            console.error("Failed to parse AI response:", aiResponse);
            return res.status(502).json({ error: "AI service returned an invalid response format", details: aiResponse });
        }

        const stars = Math.floor(parsed.total_score / 20);

        const project = new Project({

            ...req.body,

            execution_score: parsed.execution_score,
            innovation_score: parsed.innovation_score,
            validation_score: parsed.validation_score,
            team_score: parsed.team_score,
            funding_readiness: parsed.funding_readiness,
            consistency_score: parsed.consistency_score,

            total_score: parsed.total_score,
            stars: stars,
            domain: parsed.domain,
            risk_level: parsed.risk_level,
            feedback: parsed.feedback

        });

        await project.save();

        if (project.total_score > 70) {
            const Notification = require("../models/Notification");
            
            // Link to the user who requested the evaluation if provided
            const ownerId = req.body.userId || "anonymous_user";

            await Notification.create({
                userId: ownerId,
                message: `Your project '${project.title}' is now investor-ready!`,
                type: "achievement",
                read: false
            });
        }

        res.json(project);

    } catch (err) {

        console.log(err);
        res.status(500).json({ error: "Evaluation failed" });

    }

});

module.exports = router;