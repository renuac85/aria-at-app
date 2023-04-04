const { AuthenticationError } = require('apollo-server');
const {
    getTestPlanReportById,
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const recommendedStatusTargetDateResolver = require('../TestPlanReport/recommendedStatusTargetDateResolver');
const populateData = require('../../services/PopulatedData/populateData');
const getMetrics = require('../../util/getMetrics');

const updateStatusResolver = async (
    { parentContext: { id: testPlanReportId } },
    { status, candidateStatusReachedAt, recommendedStatusTargetDate },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const testPlanReport = await getTestPlanReportById(testPlanReportId);
    const runnableTests = runnableTestsResolver(testPlanReport);

    // Params to be updated on TestPlanReport
    let updateParams = { status };

    if (status !== 'DRAFT') {
        const conflicts = await conflictsResolver(testPlanReport);
        if (conflicts.length > 0) {
            throw new Error('Cannot update test plan report due to conflicts');
        }
    }

    if (status === 'CANDIDATE' || status === 'RECOMMENDED') {
        const finalizedTestResults = finalizedTestResultsResolver({
            ...testPlanReport,
            status
        });

        if (!finalizedTestResults || !finalizedTestResults.length) {
            throw new Error(
                'Cannot update test plan report because there are no ' +
                    'completed test results'
            );
        }

        const metrics = getMetrics({
            testPlanReport: {
                ...testPlanReport,
                finalizedTestResults,
                runnableTests
            }
        });

        if (status === 'CANDIDATE') {
            const candidateStatusReachedAtValue = candidateStatusReachedAt
                ? candidateStatusReachedAt
                : new Date();
            const recommendedStatusTargetDateValue = recommendedStatusTargetDate
                ? recommendedStatusTargetDate
                : recommendedStatusTargetDateResolver({
                      candidateStatusReachedAt
                  });

            updateParams = {
                ...updateParams,
                metrics: { ...testPlanReport.metrics, ...metrics },
                candidateStatusReachedAt: candidateStatusReachedAtValue,
                recommendedStatusTargetDate: recommendedStatusTargetDateValue,
                vendorReviewStatus: 'READY'
            };
        } else if (status === 'RECOMMENDED') {
            updateParams = {
                ...updateParams,
                metrics: { ...testPlanReport.metrics, ...metrics },
                recommendedStatusReachedAt: new Date()
            };
        }
    }
    await updateTestPlanReport(testPlanReportId, updateParams);

    return populateData({ testPlanReportId });
};

module.exports = updateStatusResolver;
