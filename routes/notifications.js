const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// GET /api/notifications/:userId
router.get("/:userId", async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });
            
        res.json(notifications);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

module.exports = router;