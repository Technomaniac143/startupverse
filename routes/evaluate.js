const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const evaluateProject = require("../services/geminiService");
const { evaluateSchema, validate } = require("../middleware/validate");

router.post("/", validate(evaluateSchema), async (req, res) => {

    try {

        const aiResponse = await evaluateProject(req.body);

        const parsed = JSON.parse(aiResponse);

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
            
            await Notification.create({
                userId: "projectOwner",
                message: "Your project is now investor-ready!",
                type: "achievement"
            });
        }

        res.json(project);

    } catch (err) {

        console.log(err);
        res.status(500).json({ error: "Evaluation failed" });

    }

});

module.exports = router;