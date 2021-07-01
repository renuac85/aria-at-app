import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Container, Table, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import nextId from 'react-id-generator';
import TestQueueRun from '../TestQueueRun';
import {
    AddTestPlanToQueueContainer,
    AddTestPlanToQueueModal
} from '../AddTestPlanToQueue';
import DeleteResultsModal from '../DeleteResultsModal';

import { TEST_QUEUE_PAGE_QUERY } from './queries';
import './TestQueue.css';

const TestQueue = ({ auth }) => {
    const { loading, data, refetch } = useQuery(TEST_QUEUE_PAGE_QUERY);

    const [testers, setTesters] = useState([]);
    const [testPlanReports, setTestPlanReports] = useState([]);
    const [structuredTestPlanTargets, setStructuredTestPlanTargets] = useState(
        {}
    );
    const [deleteResultsDetails, setDeleteResultsDetails] = useState({});
    const [isShowingDeleteResultsModal, enableDeleteResultsModal] = useState(
        false
    );
    const [isShowingAddToQueueModal, enableAddToQueueModal] = useState(false);

    const { isAdmin } = auth;

    useEffect(() => {
        if (data) {
            const { users = [], testPlanReports = [] } = data;
            setTesters(
                users.filter(
                    tester =>
                        tester.roles.includes('TESTER') ||
                        tester.roles.includes('ADMIN')
                )
            );
            setTestPlanReports(testPlanReports);
        }
    }, [data]);

    useEffect(() => {
        const structuredTestPlanTargets = generateStructuredTestPlanVersions(
            testPlanReports
        );
        setStructuredTestPlanTargets(structuredTestPlanTargets);
    }, [testPlanReports]);

    const generateStructuredTestPlanVersions = testPlanReports => {
        const structuredData = {};

        // get all testPlanTargets grouped to make it easier to drop into TestQueue table
        testPlanReports.forEach(testPlanReport => {
            if (!structuredData[testPlanReport.testPlanTarget.title]) {
                structuredData[testPlanReport.testPlanTarget.title] = [
                    testPlanReport
                ];
            } else {
                structuredData[testPlanReport.testPlanTarget.title].push(
                    testPlanReport
                );
            }
        });

        return structuredData;
    };

    const renderAtBrowserList = (title = '', testPlanReports = []) => {
        // means structuredTestPlanTargets would have been generated
        if (testPlanReports.length) {
            const tableId = nextId('table_name_');

            return (
                <div key={title}>
                    <h2 id={tableId}>{title}</h2>
                    <Table
                        className="test-queue"
                        aria-labelledby={tableId}
                        striped
                        bordered
                        hover
                    >
                        <thead>
                            <tr>
                                <th className="test-plan">Test Plan</th>
                                <th className="testers">Testers</th>
                                <th className="report-status">Report Status</th>
                                <th className="actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testPlanReports.map(testPlanReport => {
                                const id = nextId('test_queue_run_');
                                return (
                                    <TestQueueRun
                                        key={id}
                                        user={auth}
                                        testers={testers}
                                        testPlanReport={testPlanReport}
                                        triggerDeleteResultsModal={
                                            triggerDeleteResultsModal
                                        }
                                        triggerTestPlanReportUpdate={refetch}
                                    />
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            );
        }
        return null;
    };

    const triggerDeleteResultsModal = (
        title = null,
        username = null,
        deleteFunction = () => {}
    ) => {
        setDeleteResultsDetails({
            title,
            username,
            deleteFunction
        });

        enableDeleteResultsModal(true);
    };

    const handleDeleteResults = async () => {
        if (deleteResultsDetails.deleteFunction)
            await deleteResultsDetails.deleteFunction();
        handleCloseDeleteResultsModal();
    };

    const handleCloseDeleteResultsModal = () => {
        enableDeleteResultsModal(false);

        // reset deleteResultsDetails
        setDeleteResultsDetails({});
    };

    const handleCloseAddTestPlanToQueueModal = () =>
        enableAddToQueueModal(false);

    if (loading) return <div data-testid="test-queue-loading">Loading</div>;

    if (!testPlanReports.length) {
        const noTestPlansMessage = 'There are no Test Plans available';
        const settingsLink = <Link to="/account/settings">Settings</Link>;

        return (
            <Container as="main">
                <Helmet>
                    <title>{noTestPlansMessage} | ARIA-AT</title>
                </Helmet>
                <h2 data-testid="test-queue-no-test-plans-h2">
                    {noTestPlansMessage}
                </h2>
                <Alert
                    key="alert-configure"
                    variant="danger"
                    data-testid="test-queue-no-test-plans-p"
                >
                    {!isAdmin
                        ? `Please configure your preferred Assistive Technologies in
                    the ${settingsLink} page.`
                        : 'Add a Test Plan to the Queue'}
                </Alert>

                {isAdmin && (
                    <AddTestPlanToQueueContainer
                        handleOpenDialog={() => enableAddToQueueModal(true)}
                    />
                )}

                {isAdmin && isShowingAddToQueueModal && (
                    <AddTestPlanToQueueModal
                        show={isShowingAddToQueueModal}
                        handleClose={handleCloseAddTestPlanToQueueModal}
                        handleAddToTestQueue={refetch}
                    />
                )}
            </Container>
        );
    }

    return (
        <Container as="main">
            <Helmet>
                <title>{`Test Queue | ARIA-AT`}</title>
            </Helmet>
            <h1>Test Queue</h1>
            <p data-testid="test-queue-instructions">
                Assign yourself a test plan or start executing one that is
                already assigned to you.
            </p>

            {isAdmin && (
                <AddTestPlanToQueueContainer
                    handleOpenDialog={() => enableAddToQueueModal(true)}
                />
            )}

            {Object.keys(structuredTestPlanTargets).map(key =>
                renderAtBrowserList(key, structuredTestPlanTargets[key])
            )}

            <DeleteResultsModal
                show={isShowingDeleteResultsModal}
                isAdmin={isAdmin}
                title={deleteResultsDetails.title}
                username={deleteResultsDetails.username}
                handleClose={handleCloseDeleteResultsModal}
                handleDeleteResults={handleDeleteResults}
            />

            {isAdmin && isShowingAddToQueueModal && (
                <AddTestPlanToQueueModal
                    show={isShowingAddToQueueModal}
                    handleClose={handleCloseAddTestPlanToQueueModal}
                    handleAddToTestQueue={refetch}
                />
            )}
        </Container>
    );
};

TestQueue.propTypes = {
    auth: PropTypes.object
};

const mapStateToProps = state => {
    const { auth } = state;
    return { auth };
};

export default connect(mapStateToProps)(TestQueue);
