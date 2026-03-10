const express = require("express");
const router = express.Router();

const Investor = require("../models/Investor");
const Project = require("../models/Project");

/*
TEMPORARY ROUTE
This inserts some sample investors into the database
*/
router.get("/seed", async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ error: "Forbidden: Seeding is only allowed in development mode" });
    }

    try {

        await Investor.insertMany([

            {
                name: "Alpha Ventures",
                domainInterest: ["AI", "SaaS"],
                preferredStage: "prototype",
                minTicket: 5000,
                maxTicket: 50000,
                riskTolerance: "medium",
                location: "India"
            },

            {
                name: "NextGen Capital",
                domainInterest: ["FinTech", "AI"],
                preferredStage: "revenue",
                minTicket: 20000,
                maxTicket: 200000,
                riskTolerance: "low",
                location: "Singapore"
            },

            {
                name: "FutureSpark Fund",
                domainInterest: ["HealthTech", "AI"],
                preferredStage: "idea",
                minTicket: 1000,
                maxTicket: 15000,
                riskTolerance: "high",
                location: "India"
            }

        ]);

        res.json({ message: "Investors inserted into database" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to seed investors" });
    }

});


/*
MATCHING ROUTE
Matches a project with investors
*/
router.get("/match/:projectId", async (req, res) => {

    try {

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const investors = await Investor.find();

        let matches = [];

        investors.forEach(inv => {

            let score = 0;

            if (inv.domainInterest.includes(project.domain))
                score += 30;

            if (inv.preferredStage === project.stage)
                score += 25;

            if (project.fundingNeeded >= inv.minTicket &&
                project.fundingNeeded <= inv.maxTicket)
                score += 20;

            if (inv.riskTolerance === project.risk_level)
                score += 15;

            if (project.total_score > 70)
                score += 10;

            matches.push({
                investor: inv,
                compatibilityScore: score
            });

        });

        matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        res.json(matches.slice(0, 5));

    } catch (err) {

        console.log(err);
        res.status(500).json({ error: "Matching failed" });

    }

});

module.exports = router;