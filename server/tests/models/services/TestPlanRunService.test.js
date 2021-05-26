const { sequelize } = require('../../../models');
const TestPlanRunService = require('../../../models/services/TestPlanRunService');
const { dbCleaner } = require('../../util/db-cleaner');

describe('TestPlanRunModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid testPlanRun for id query', async () => {
        const _id = 1;

        const testPlanRun = await TestPlanRunService.getTestPlanRunById(_id);
        const { id, testerUserId, testPlanReportId, testResults } = testPlanRun;

        expect(id).toEqual(_id);
        expect(testerUserId).toBeTruthy();
        expect(testPlanReportId).toBeTruthy();
        expect(testResults).toBeTruthy();
    });

    it('should not be valid testPlanRun query', async () => {
        const _id = 53935;

        const user = await TestPlanRunService.getTestPlanRunById(_id);
        expect(user).toBeNull();
    });

    it('should contain valid testPlanRun', async () => {
        const _id = 1;

        const testPlanRun = await TestPlanRunService.getTestPlanRunById(_id);
        const { testPlanReport } = testPlanRun;

        expect(testPlanReport).toBeTruthy();
        expect(testPlanReport).toHaveProperty('id');
    });

    it('should not create additional testPlanRun if already exists for tester; return testPlanRun if exists instead', async () => {
        await dbCleaner(async () => {
            const _testPlanReportId = 1;
            const _testerUserId = 1;

            const testPlanRuns = await TestPlanRunService.getTestPlanRuns('');
            const testPlanRunsLength = testPlanRuns.length;

            const testPlanRun = await TestPlanRunService.createTestPlanRun({
                testerUserId: _testerUserId,
                testPlanReportId: _testPlanReportId,
            });
            const newTestPlanRuns = await TestPlanRunService.getTestPlanRuns(
                ''
            );
            const newTestPlanRunsLength = newTestPlanRuns.length;

            expect(testPlanRun).toHaveProperty('id');
            expect(testPlanRun).toHaveProperty('testerUserId');
            expect(testPlanRun).toHaveProperty('testPlanReportId');
            expect(testPlanRunsLength).toEqual(newTestPlanRunsLength);
        });
    });

    it('should create testPlanRun if none exists for tester', async () => {
        await dbCleaner(async () => {
            const _testPlanReportId = 1;
            const _testerUserId = 2;

            const testPlanRuns = await TestPlanRunService.getTestPlanRuns('');
            const testPlanRunsLength = testPlanRuns.length;

            const testPlanRun = await TestPlanRunService.createTestPlanRun({
                testerUserId: _testerUserId,
                testPlanReportId: _testPlanReportId,
            });
            const newTestPlanRuns = await TestPlanRunService.getTestPlanRuns(
                ''
            );
            const newTestPlanRunsLength = newTestPlanRuns.length;

            expect(testPlanRun).toHaveProperty('id');
            expect(testPlanRun).toHaveProperty('testerUserId');
            expect(testPlanRun).toHaveProperty('testPlanReportId');
            expect(newTestPlanRunsLength).toBeGreaterThan(testPlanRunsLength);
            expect(newTestPlanRunsLength).toEqual(testPlanRunsLength + 1);
        });
    });

    it('should create and update a new testPlanRun', async () => {
        await dbCleaner(async () => {
            const _testPlanReportId = 1;
            const _testerUserId = 2;
            const _testResults = [{ test: 'goesHere' }, { test: 'goesHere' }];

            const testPlanRun = await TestPlanRunService.createTestPlanRun({
                testerUserId: _testerUserId,
                testPlanReportId: _testPlanReportId,
                testResults: _testResults,
            });

            const { id, testerUserId, testPlanReportId, testResults } =
                testPlanRun;

            const updatedTestPlanRun =
                await TestPlanRunService.updateTestPlanRun(id, {
                    testResults: [{ test: 'goesHere' }],
                });
            const {
                testerUserId: updatedTesterUserId,
                testPlanReportId: updatedTestPlanReportId,
                testResults: updatedTestResults,
            } = updatedTestPlanRun;

            // after testPlanRun created
            expect(id).toBeTruthy();
            expect(testerUserId).toBeTruthy();
            expect(testPlanReportId).toBeTruthy();

            // after testPlanRun updated
            expect(updatedTesterUserId).toEqual(testerUserId);
            expect(updatedTestPlanReportId).toEqual(testPlanReportId);
            expect(updatedTestResults.length).not.toEqual(testResults.length);
        });
    });

    it('should remove existing testPlanRun', async () => {
        await dbCleaner(async () => {
            const _id = 1;

            const testPlanRun = await TestPlanRunService.getTestPlanRunById(
                _id
            );

            await TestPlanRunService.removeTestPlanRun(_id);

            const deletedTestPlanRun =
                await TestPlanRunService.getTestPlanRunById(_id);

            // before testPlanRun removed
            expect(testPlanRun).not.toBeNull();

            // after testPlanRun removed
            expect(deletedTestPlanRun).toBeNull();
        });
    });

    it('should return collection of testPlanRuns', async () => {
        const result = await TestPlanRunService.getTestPlanRuns('', {});
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of testPlanRuns with paginated structure', async () => {
        const result = await TestPlanRunService.getTestPlanRuns(
            '',
            {},
            ['id'],
            [],
            [],
            { enablePagination: true }
        );
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});
