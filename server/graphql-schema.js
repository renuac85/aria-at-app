const { gql } = require('apollo-server');

const graphqlSchema = gql`
    # Required for mutations that do not return anything
    scalar NoResponse

    """
    ISO-8601-formatted timestamp.
    """
    scalar Timestamp

    enum Role {
        TESTER
        ADMIN
    }

    type User {
        id: ID!
        username: String!
        roles: [Role]!
    }

    type Browser {
        id: ID!
        name: String!
        browserVersions: [String]!
    }

    enum AtMode {
        READING
        INTERACTION
        MODELESS
    }

    type At {
        id: ID!
        name: String!
        modes: [AtMode]!
        atVersions: [String]!
    }

    """
    Specifies which AT and browser combination we are testing, divided into
    buckets for each major version.
    """
    type TestPlanTarget {
        id: ID!
        title: String!
        at: At!
        atVersion: String!
        browser: Browser!
        browserVersion: String!
        testPlanReports: [TestPlanReport]!
    }

    input TestPlanTargetInput {
        atId: ID!
        atVersion: String!
        browserId: ID!
        browserVersion: String!
    }

    enum TestPlanVersionStatus {
        DRAFT
        IN_REVIEW
        FINALIZED
    }

    type TestPlan {
        """
        Corresponds to the ARIA-AT directory storing the test plan.
        """
        id: ID!
        # TODO: determine if isObsolete is needed.
        # """
        # Whether the directory still exists in the ARIA-AT repo.
        # """
        # isObsolete: Boolean!
        """
        A least one argument is required. Determines what type of test plan to
        load. Will load the latest version matching the criteria.
        """
        latestTestPlanVersion(
            status: TestPlanVersionStatus
            testPlanReportStatus: TestPlanReportStatus
            atGitSha: String
            atSemanticVersion: String
        ): TestPlanVersion
        """
        Loads multiple historic versions of the test plan, accepting filter
        criteria.
        """
        testPlanVersions(
            status: TestPlanVersionStatus
            testPlanReportStatus: TestPlanReportStatus
        ): [TestPlanVersion]
    }

    type TestPlanVersion {
        id: ID!
        title: String
        status: TestPlanVersionStatus!
        gitSha: String!
        gitMessage: String!
        semanticVersion: String
        # TODO: determine if isLatest is needed
        # isLatest: Boolean!
        updatedAt: Timestamp!
        exampleUrl: String!
        directory: String!
        tests: [Test]!
        testCount: Int!
        testPlanReports(status: TestPlanReportStatus): [TestPlanReport]!
    }

    interface BaseTest {
        title: String!
        index: Int!
        referenceFilePath: String!
    }

    type Test implements BaseTest {
        title: String!
        index: Int!
        referenceFilePath: String!
        # TODO: account for running scripts
        instructions: [Instruction]!
        assertions: [Assertion]!
        passThroughs: [PassThrough]!
        assertionCount: Int!
        optionalAssertionCount: Int!
    }

    type Instruction {
        # TODO: account for automation
        manualInstruction: String!
    }

    interface BaseAssertion {
        # TODO: account for at-specific assertions
        # TODO: account for optional assertions
        # TODO: account for automation
        manualAssertion: String!
    }

    type Assertion implements BaseAssertion {
        manualAssertion: String!
        command: String!
        priority: String!
    }

    interface PassThrough {
        index: Int!
        atMode: String!
        nthCommand: Int!
        # Examples would go here if we support multiple examples for one test.
    }

    type TestResult implements BaseTest {
        title: String!
        index: Int!
        referenceFilePath: String!
        instructions: [Instruction]!
        assertions: [Assertion]!
        passThroughs: [PassThrough]!
        assertionCount: Int!
        optionalAssertionCount: Int!

        isComplete: Boolean!
        isSkipped: Boolean!

        passThroughResults: [PassThroughResult]!
        assertionsPassed: Int!
        optionalAssertionsPassed: Int!
        unexpectedBehaviorCount: Int!

        result: TestResultResult
        serializedForm: [TestResultSerializedForm]
        issues: [Int]
    }

    type TestResultResult {
        test: String!
        status: String!
        details: TestResultResultDetails!
    }

    type TestResultResultDetails {
        name: String!
        task: String!
        summary: TestResultResultDetailsSummary!
        commands: [TestResultResultDetailsCommands]!
        specific_user_instruction: String!
    }

    type TestResultResultDetailsSummary {
        # required/optional needs to be transformed from '1'/'2'
        required: TestResultResultDetailsSummaryPriority!
        optional: TestResultResultDetailsSummaryPriority!
        unexpectedCount: Int!
    }

    type TestResultResultDetailsSummaryPriority {
        pass: Int!
        fail: Int!
    }

    type TestResultResultDetailsCommands {
        output: String!
        command: String!
        support: String!
        assertions: [TestResultResultDetailsCommandsAssertion]!
        unexpected_behaviors: [String]!
    }

    type TestResultResultDetailsCommandsAssertion {
        pass: String
        fail: String
        priority: String!
        assertion: String!
    }

    type TestResultSerializedForm {
        name: String!
        value: String!
        checked: Boolean
        disabled: Boolean
        indeterminate: Boolean
    }

    type PassThroughResult implements PassThrough {
        index: Int!
        atMode: String!
        nthCommand: Int!

        output: String!
        assertionResults: [AssertionResult]!
        unexpectedBehaviors: [UnexpectedBehavior]!
    }

    type AssertionResult implements BaseAssertion {
        manualAssertion: String!
        passed: Boolean!
    }

    type UnexpectedBehavior {
        id: ID!
        description: String!
    }

    type TestResultConflict {
        breadcrumbs: String! # TBD
    }

    type TestPlanRun {
        id: ID!
        tester: User
        isManuallyTested: Boolean!
        isComplete: Boolean!
        testResults: [TestResult]!
        testResultCount: Int!
    }

    enum TestPlanReportStatus {
        DRAFT
        IN_REVIEW
        REMOVED
        FINALIZED
    }

    type TestPlanReport {
        id: ID!
        status: TestPlanReportStatus!
        supportPercent: Int!
        optionalSupportPercent: Int!
        testPlanTarget: TestPlanTarget!
        testPlanVersion: TestPlanVersion!
        conflicts: [TestResultConflict]!
        conflictCount: Int!
        """
        Finalizing a test plan report requires resolving any conflicts between
        runs. At this stage a single set of results is able to represent all
        results, and is much more convenient to work with.
        """
        finalizedTestPlanRun: TestPlanRun
        draftTestPlanRuns: [TestPlanRun]!
        createdAt: Timestamp!
    }

    input TestPlanReportInput {
        testPlanVersionId: ID!
        testPlanTarget: TestPlanTargetInput!
    }

    input TestResultInput {
        index: Int!
        # TODO: Revise transforming this structure for GraphQL
        test: TestResultTestInput
        result: TestResultResultInput
        serializedForm: [TestResultSerializedFormInput]
        issues: [Int]
    }

    input TestResultTestInput {
        htmlFile: String!
        testFullName: String!
        executionOrder: Int!
    }

    input TestResultResultInput {
        test: String!
        status: String!
        details: TestResultResultDetailsInput!
    }

    input TestResultResultDetailsInput {
        name: String!
        task: String!
        summary: TestResultResultDetailsSummaryInput!
        commands: [TestResultResultDetailsCommandsInput]!
        specific_user_instruction: String!
    }

    input TestResultResultDetailsSummaryInput {
        # required/optional needs to be transformed from '1'/'2'
        required: TestResultResultDetailsSummaryPriorityInput!
        optional: TestResultResultDetailsSummaryPriorityInput!
        unexpectedCount: Int!
    }

    input TestResultResultDetailsSummaryPriorityInput {
        pass: Int!
        fail: Int!
    }

    input TestResultResultDetailsCommandsInput {
        output: String!
        command: String!
        support: String!
        assertions: [TestResultResultDetailsCommandsAssertionInput]!
        unexpected_behaviors: [String]!
    }

    input TestResultResultDetailsCommandsAssertionInput {
        pass: String
        fail: String
        priority: String!
        assertion: String!
    }

    input TestResultSerializedFormInput {
        name: String!
        value: String!
        checked: Boolean
        disabled: Boolean
        indeterminate: Boolean
    }

    """
    A particular traversal of the TestPlan data - allowing for highlighting a
    TestPlan, TestPlanVersion, TestPlanReport, or even subsets of those.
    """
    input LocationOfDataInput {
        testPlanId: ID
        testPlanVersionId: ID
        testIndex: Int
        passThroughIndex: Int
        testPlanReportId: ID
        testPlanTargetId: ID
        browserId: ID
        browserVersion: String
        atId: ID
        atVersion: String
        testPlanRunId: ID
        testResultIndex: Int
        passThroughResultIndex: Int
    }
    """
    A particular traversal of the TestPlan data - allowing for highlighting a
    TestPlan, TestPlanVersion, TestPlanReport, or even subsets of those.
    """
    type LocationOfData {
        testPlanId: ID
        testPlanVersionId: ID
        testIndex: Int
        passThroughIndex: Int
        testPlanReportId: ID
        testPlanTargetId: ID
        browserId: ID
        browserVersion: String
        atId: ID
        atVersion: String
        testPlanRunId: ID
        testResultIndex: Int
        passThroughResultIndex: Int
    }

    """
    All the records that are associated with the id(s) of a given locationOfData
    """
    type PopulatedData {
        locationOfData: LocationOfData!
        testPlan: TestPlan
        testPlanVersion: TestPlanVersion
        testPlanTarget: TestPlanTarget
        at: At
        browser: Browser
        atVersion: String
        browserVersion: String
        test: Test
        passThrough: PassThrough
        testPlanReport: TestPlanReport
        testPlanRun: TestPlanRun
        testResult: TestResult
        passThroughResult: PassThroughResult
    }

    type Query {
        me: User
        users: [User]
        ats: [At]
        browsers: [Browser]
        testPlans: [TestPlan]!
        testPlanVersions: [TestPlanVersion]
        testPlan(id: ID!): TestPlan
        testPlanReport(id: ID): TestPlanReport
        testPlanReports(statuses: [TestPlanReportStatus]): [TestPlanReport]!
        testPlanTargets: [TestPlanTarget]!
        testPlanRun(id: ID): TestPlanRun
        populateData(locationOfData: LocationOfDataInput!): PopulatedData!
    }

    # Mutation-specific types below

    type TestPlanReportOperations {
        assignTester(userId: ID!): PopulatedData!
        deleteTestPlanRun(userId: ID!): PopulatedData!
        deleteTestPlanRunResults(userId: ID!): PopulatedData!
        updateStatus(status: TestPlanReportStatus!): PopulatedData!
    }

    type TestPlanRunOperations {
        updateTestResult(input: TestResultInput!): PopulatedData!
        clearTestResult(input: TestResultInput!): PopulatedData!
    }

    type findOrCreateResult {
        populatedData: PopulatedData!
        """
        There will be one array item per database record created.
        """
        created: [PopulatedData]!
    }

    type Mutation {
        findOrCreateTestPlanReport(
            input: TestPlanReportInput!
        ): findOrCreateResult!
        testPlanReport(id: ID!): TestPlanReportOperations!
        testPlanRun(id: ID!): TestPlanRunOperations!
    }
`;

module.exports = graphqlSchema;
