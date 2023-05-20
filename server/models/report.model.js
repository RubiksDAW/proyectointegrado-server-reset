const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  routeId:{type:String, required:true},
  reason: { type: String, required: true },
  description: { type: String, required: false },
});

const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;
