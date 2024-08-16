const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    policyNumber: String,
    policyStartDate: Date,
    policyEndDate: Date,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Policy', policySchema);
