const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({

    title: String,
    description: String,
    techStack: String,
    stage: String,
    validation: String,
    fundingNeeded: Number,
    teamSize: Number,

    execution_score: Number,
    innovation_score: Number,
    validation_score: Number,
    team_score: Number,
    funding_readiness: Number,
    consistency_score: Number,

    total_score: Number,
    stars: Number,
    domain: String,
    risk_level: String,
    feedback: String,
    createdAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);