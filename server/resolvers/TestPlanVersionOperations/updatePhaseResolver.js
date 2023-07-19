const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReport,
    getTestPlanReports
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const recommendedPhaseTargetDateResolver = require('../TestPlanVersion/recommendedPhaseTargetDateResolver');
const populateData = require('../../services/PopulatedData/populateData');
const getMetrics = require('../../util/getMetrics');
const {
    getTestPlanVersionById,
    updateTestPlanVersion
} = require('../../models/services/TestPlanVersionService');

const updatePhaseResolver = async (
    { parentContext: { id: testPlanVersionId } },
    {
        phase,
        candidatePhaseReachedAt,
        recommendedPhaseTargetDate,
        // TODO: The following flag will be unnecessary once the application no longer allows
        //  individual TestPlanReport updating of phase
        changePhaseWithoutForcingTestPlanReportsUpdate = false
    },
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const testPlanVersion = await getTestPlanVersionById(testPlanVersionId);

    // Move only the TestPlanReports which also have the same phase as the TestPlanVersion
    const whereTestPlanVersion = {
        testPlanVersionId
    };
    whereTestPlanVersion.status = testPlanVersion.phase;
    const testPlanReports = await getTestPlanReports(
        null,
        whereTestPlanVersion,
        null,
        null,
        null,
        null,
        null,
        null,
        {
            order: [['createdAt', 'desc']]
        }
    );

    // Params to be updated on TestPlanVersion (or TestPlanReports)
    let updateParams = { phase, status: phase };

    if (!changePhaseWithoutForcingTestPlanReportsUpdate) {
        for (let key in testPlanReports) {
            const testPlanReport = testPlanReports[key];
            const testPlanReportId = testPlanReport.id;

            // const testPlanReport = await getTestPlanReportById(testPlanReportId);
            const runnableTests = runnableTestsResolver(testPlanReport);

            if (phase !== 'DRAFT') {
                const conflicts = await conflictsResolver(
                    testPlanReport,
                    null,
                    context
                );
                if (conflicts.length > 0) {
                    throw new Error(
                        'Cannot update test plan report due to conflicts'
                    );
                }
            }

            if (phase === 'CANDIDATE' || phase === 'RECOMMENDED') {
                const finalizedTestResults = await finalizedTestResultsResolver(
                    {
                        ...testPlanReport,
                        phase,
                        status: phase
                    },
                    null,
                    context
                );

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

                if (phase === 'CANDIDATE') {
                    const candidatePhaseReachedAtValue = candidatePhaseReachedAt
                        ? candidatePhaseReachedAt
                        : new Date();
                    const recommendedPhaseTargetDateValue =
                        recommendedPhaseTargetDate
                            ? recommendedPhaseTargetDate
                            : recommendedPhaseTargetDateResolver({
                                  candidatePhaseReachedAt
                              });

                    updateParams = {
                        ...updateParams,
                        metrics: { ...testPlanReport.metrics, ...metrics },
                        candidatePhaseReachedAt: candidatePhaseReachedAtValue,
                        recommendedPhaseTargetDate:
                            recommendedPhaseTargetDateValue,
                        vendorReviewStatus: 'READY'
                    };
                } else if (phase === 'RECOMMENDED') {
                    updateParams = {
                        ...updateParams,
                        metrics: { ...testPlanReport.metrics, ...metrics },
                        recommendedPhaseReachedAt: new Date()
                    };
                }
            }
            await updateTestPlanReport(testPlanReportId, updateParams);
        }
    }
    await updateTestPlanVersion(testPlanVersionId, updateParams);

    return populateData({ testPlanVersionId }, { context });
};

module.exports = updatePhaseResolver;