import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { differenceBy } from 'lodash';
import getMetrics from './getMetrics';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';

const SummarizeTestPlanVersion = ({ testPlanVersion, testPlanReports }) => {
    const { exampleUrl, designPatternUrl } = testPlanVersion.metadata;
    return (
        <Fragment>
            <h1>{getTestPlanVersionTitle(testPlanVersion)}</h1>
            <h2>Metadata</h2>
            <ul>
                {exampleUrl ? (
                    <li>
                        <a href={exampleUrl} target="_blank" rel="noreferrer">
                            Example Under Test
                        </a>
                    </li>
                ) : null}
                {designPatternUrl ? (
                    <li>
                        <a
                            href={designPatternUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Design Pattern
                        </a>
                    </li>
                ) : null}
            </ul>

            {testPlanReports.map(testPlanReport => {
                const skippedTests = differenceBy(
                    testPlanReport.runnableTests,
                    testPlanReport.finalizedTestResults,
                    testOrTestResult =>
                        testOrTestResult.test?.id ?? testOrTestResult.id
                );
                const overallMetrics = getMetrics({ testPlanReport });

                const { testPlanTarget } = testPlanReport;

                return (
                    <Fragment key={testPlanReport.id}>
                        <h2>{getTestPlanTargetTitle(testPlanTarget)}</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Test Name</th>
                                    <th>Required Assertions</th>
                                    <th>Optional Assertions</th>
                                    <th>Unexpected Behaviors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testPlanReport.finalizedTestResults.map(
                                    testResult => {
                                        const testResultMetrics = getMetrics({
                                            testResult
                                        });
                                        return (
                                            <tr key={testResult.id}>
                                                <td>{testResult.test.title}</td>
                                                <td>
                                                    {
                                                        testResultMetrics.requiredFormatted
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        testResultMetrics.optionalFormatted
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        testResultMetrics.unexpectedBehaviorsFormatted
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                                <tr>
                                    <td>All Tests</td>
                                    <td>{overallMetrics.requiredFormatted}</td>
                                    <td>{overallMetrics.optionalFormatted}</td>
                                    <td>
                                        {
                                            overallMetrics.unexpectedBehaviorsFormatted
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {skippedTests.length ? (
                            <Fragment>
                                <h3>Skipped Tests</h3>
                                <ol>
                                    {skippedTests.map(test => (
                                        <li key={test.id}>{test.title}</li>
                                    ))}
                                </ol>
                            </Fragment>
                        ) : null}
                    </Fragment>
                );
            })}
        </Fragment>
    );
};

SummarizeTestPlanVersion.propTypes = {
    testPlanVersion: PropTypes.shape({
        title: PropTypes.string.isRequired,
        metadata: PropTypes.shape({
            exampleUrl: PropTypes.string.isRequired,
            designPatternUrl: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    testPlanReports: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            runnableTests: PropTypes.arrayOf(PropTypes.object).isRequired,
            finalizedTestResults: PropTypes.arrayOf(PropTypes.object).isRequired
        }).isRequired
    ).isRequired
};

export default SummarizeTestPlanVersion;