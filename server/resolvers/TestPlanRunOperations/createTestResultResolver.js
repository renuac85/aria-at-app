const { AuthenticationError, UserInputError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const createTestResultSkeleton = require('./createTestResultSkeleton');

const createTestResultResolver = async (
    { parentContext: { id: testPlanRunId } },
    { testId },
    { user }
) => {
    let testPlanRun, testPlanTarget, test;
    try {
        ({ testPlanRun, testPlanTarget } = await populateData({
            testPlanRunId
        }));
        ({ test } = await populateData({ testId }));
    } catch {
        throw new UserInputError('Failed to load data for the given ID');
    }

    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            (user?.roles.find(role => role.name === 'TESTER') &&
                testPlanRun.testerUserId == user.id)
        )
    ) {
        throw new AuthenticationError();
    }

    if (!test.atIds.find(atId => atId === testPlanTarget.at.id)) {
        throw new UserInputError(
            'The given test is not runnable as part of this TestPlanReport'
        );
    }

    const newTestResult = createTestResultSkeleton({
        test,
        testPlanRun,
        testPlanTarget
    });

    const alreadyExists = !!testPlanRun.testResults.find(
        testResult => testResult.id === newTestResult.id
    );
    if (!alreadyExists) {
        const newTestResults = [...testPlanRun.testResults, newTestResult];
        await updateTestPlanRun(testPlanRun.id, {
            testResults: newTestResults
        });
    }

    return populateData({ testResultId: newTestResult.id });
};

module.exports = createTestResultResolver;
