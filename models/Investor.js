const mongoose = require("mongoose");

const InvestorSchema = new mongoose.Schema({

    name: String,

    domainInterest: [String],   // ex: ["AI","FinTech"]

    preferredStage: String,     // idea | prototype | revenue | scalable

    minTicket: Number,
    maxTicket: Number,

    riskTolerance: String,      // low | medium | high

    location: String

});

module.exports = mongoose.model("Investor", InvestorSchema);