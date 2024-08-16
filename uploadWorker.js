const { workerData, parentPort } = require('worker_threads');
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const User = require('../models/User');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Carrier = require('../models/Carrier');
const Policy = require('../models/Policy');

mongoose.connect('mongodb://localhost:27017/insuranceDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const results = [];

fs.createReadStream(workerData.filePath)
    .pipe(csv())
    .on('data', async (data) => {
        results.push(data);
    })
    .on('end', async () => {
        try {
            // Here you can parse the results and save to MongoDB collections
            for (const row of results) {
                const agent = new Agent({ agentName: row['Agent Name'] });
                await agent.save();

                const user = new User({
                    firstName: row['First Name'],
                    dob: new Date(row['DOB']),
                    address: row['Address'],
                    phoneNumber: row['Phone Number'],
                    state: row['State'],
                    zipCode: row['Zip Code'],
                    email: row['Email'],
                    gender: row['Gender'],
                    userType: row['User Type'],
                });
                await user.save();

                const account = new Account({ accountName: row['Account Name'] });
                await account.save();

                const category = new Category({ categoryName: row['Category Name'] });
                await category.save();

                const carrier = new Carrier({ companyName: row['Company Name'] });
                await carrier.save();

                const policy = new Policy({
                    policyNumber: row['Policy Number'],
                    policyStartDate: new Date(row['Policy Start Date']),
                    policyEndDate: new Date(row['Policy End Date']),
                    categoryId: category._id,
                    companyId: carrier._id,
                    userId: user._id,
                });
                await policy.save();
            }
            parentPort.postMessage('Data uploaded successfully');
        } catch (error) {
            parentPort.postMessage(`Error: ${error.message}`);
        }
    });
