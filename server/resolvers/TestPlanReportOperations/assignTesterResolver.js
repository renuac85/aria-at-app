const { AuthenticationError } = require('apollo-server');
const {
    createTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populatedDataResolver = require('../PopulatedData');

const assignTesterResolver = async (
    { parentContext: { id: testPlanReportId } },
    { userId: testerUserId },
    { user }
) => {
    let roles = [...user.roles];
    if (user.roles.length && typeof user.roles[0] === 'object')
        roles = user.roles.map(role => role.name);

    // prettier-ignore
    if (
        !roles.includes('ADMIN') &&
        (roles.includes('TESTER') && testerUserId === user.id)
    ) {
        throw new AuthenticationError();
    }

    const { id: testPlanRunId } = await createTestPlanRun({
        testPlanReportId,
        testerUserId
    });

    return populatedDataResolver({
        parentContext: { locationOfData: { testPlanReportId, testPlanRunId } }
    });
};

module.exports = assignTesterResolver;
