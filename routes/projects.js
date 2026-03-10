const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// 1️⃣ PROJECT FEED API
router.get("/feed", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const projects = await Project.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('_id title description total_score stars domain risk_level createdAt');
        
        const total = await Project.countDocuments();

        res.json({
            data: projects,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch project feed" });
    }
});

// 2️⃣ ANALYTICS DASHBOARD API
router.get("/analytics", async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        
        // Use Aggregation Framework to calculate totals and count domains directly in DB
        const stats = await Project.aggregate([
            {
                $facet: {
                    domainGroups: [
                        { $group: { _id: { $ifNull: ["$domain", "Unknown"] }, count: { $sum: 1 } } }
                    ],
                    scoreStats: [
                        { 
                            $group: { 
                                _id: null, 
                                totalScoreSum: { $sum: "$total_score" },
                                highScorers: { 
                                    $sum: { $cond: [{ $gt: ["$total_score", 70] }, 1, 0] } 
                                }
                            } 
                        }
                    ]
                }
            }
        ]);

        const result = stats[0];
        const scoreData = result.scoreStats[0] || { totalScoreSum: 0, highScorers: 0 };
        
        let domainDistribution = {};
        result.domainGroups.forEach(d => {
            domainDistribution[d._id] = d.count;
        });

        const averageScore = totalProjects > 0 ? (scoreData.totalScoreSum / totalProjects) : 0;
        const highScoreProjects = scoreData.highScorers;

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

// Helper function to escape regex special characters
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 3️⃣ SEARCH API
router.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: "Search query required" });
        }

        const safeQuery = escapeRegex(query);

        const projects = await Project.find({
            title: { $regex: safeQuery, $options: "i" }
        }).select('_id title description total_score stars domain risk_level createdAt');

        res.json(projects);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Search failed" });
    }
});

module.exports = router;
