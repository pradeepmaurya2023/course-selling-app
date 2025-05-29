const mongoose = require("mongoose");

const purchasesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  courseId: {
    type: mongoose.Types.ObjectId,
  },
});

const Purchases = mongoose.model("purchases", purchasesSchema);
module.exports = Purchases;
