const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// 1️⃣ PROJECT FEED API
router.get("/feed", async (req, res) => {
    try {
        const projects = await Project.find()
            .sort({ createdAt: -1 })
            .select('_id title description total_score stars domain risk_level createdAt');
        
        res.json(projects);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch project feed" });
    }
});

// 2️⃣ ANALYTICS DASHBOARD API
router.get("/analytics", async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        
        const projects = await Project.find();
        
        let totalScoreSum = 0;
        let highScoreProjects = 0;
        let domainDistribution = {
            AI: 0,
            FinTech: 0,
            HealthTech: 0,
            Other: 0
        };

        projects.forEach(p => {
            totalScoreSum += p.total_score || 0;
            if (p.total_score > 70) highScoreProjects++;
            
            if (p.domain) {
                if (domainDistribution[p.domain] !== undefined && p.domain !== 'Other') {
                    domainDistribution[p.domain]++;
                } else {
                    domainDistribution.Other++;
                }
            }
        });

        const averageScore = totalProjects > 0 ? (totalScoreSum / totalProjects) : 0;

        res.json({
            totalProjects,
            averageScore,
            highScoreProjects,
            domainDistribution
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

module.exports = router;
