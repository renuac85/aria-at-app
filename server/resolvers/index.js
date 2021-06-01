const me = require('./meResolver');
const testPlans = require('./testPlanVersionsResolver');
const testPlanReport = require('./testPlanReportResolver');
const mutateTestPlanReport = require('./mutateTestPlanReportResolver');
const User = require('./User');
const populateLocationOfData = require('./populateLocationOfDataResolver');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanReportOperations = require('./TestPlanReportOperations');
const TestPlanReportOperationResult = require('./TestPlanReportOperationResult');
const TestPlanRun = require('./TestPlanRun');

const resolvers = {
    Query: {
        me,
        testPlans,
        testPlanReport,
        populateLocationOfData
    },
    Mutation: {
        testPlanReport: mutateTestPlanReport
    },
    User,
    TestPlanVersion,
    TestPlanReport,
    TestPlanReportOperations,
    TestPlanReportOperationResult,
    TestPlanRun
};

module.exports = resolvers;
