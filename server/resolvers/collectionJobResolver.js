const {
    getCollectionJobById
} = require('../models/services/CollectionJobService');

const collectionJobResolver = async (_, { id }, context) => {
    const { transaction } = context;

    const collectionJob = await getCollectionJobById({ id, transaction });

    // resolve tests
    const { tests } = collectionJob.testPlanRun.testPlanReport.testPlanVersion;

    collectionJob.testStatus.forEach(testStatus => {
        testStatus.test = tests.find(t => t.id === testStatus.testId);
    });

    return collectionJob;
};

module.exports = collectionJobResolver;
