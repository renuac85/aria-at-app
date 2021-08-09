const {
    getTestPlanRunById,
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populatedDataResolver = require('../PopulatedData');
const validateTestResult = require('../../util/validateTestResult');

const updateTestResultResolver = async (
    { parentContext: { id: testPlanRunId } },
    { input }
) => {
    const { index, test, result, serializedForm, issues = [] } = input;

    const testResultInput = {
        test,
        result,
        serializedForm,
        issues
    };

    const validatedTestResult = await validateTestResult(testResultInput);

    const testPlanRun = await getTestPlanRunById(testPlanRunId);
    let { testResults } = testPlanRun;

    // newly created TestPlanRun
    if (!testResults) testResults = [];

    let testResultToUpdateIndex = testResults.findIndex(
        testResult => testResult.test.executionOrder === index
    );

    if (testResultToUpdateIndex < 0) {
        // 'test' object MUST exist if 'testResults' are null during first run
        if (!test) throw new Error("No 'test' object provided");

        testResultToUpdateIndex = testResults.length;
        testResults[testResultToUpdateIndex] = validatedTestResult;
    }

    // comes from the iframe result after submitting a test
    if (result) {
        testResults[testResultToUpdateIndex].result = {
            ...testResults[testResultToUpdateIndex].result,
            ...validatedTestResult.result
        };
    }

    // when someone submits or skips the current test plan results
    if (serializedForm) {
        testResults[testResultToUpdateIndex].serializedForm = [
            ...serializedForm
        ];
    }

    // represents GitHub issues
    if (issues.length) {
        testResults[testResultToUpdateIndex].issues = [
            ...(testResults[testResultToUpdateIndex].issues || []),
            ...issues
        ];
    }

    await updateTestPlanRun(testPlanRunId, { testResults });

    return populatedDataResolver({
        parentContext: { locationOfData: { testPlanRunId } }
    });
};

module.exports = updateTestResultResolver;
