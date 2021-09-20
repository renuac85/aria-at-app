const conflictsResolver = testPlanReport => {
    const conflictsResult = {};
    const tests = {};

    testPlanReport.testPlanRuns.forEach(testPlanRun => {
        testPlanRun.testResults.forEach(testResult => {
            if (testResult.result) {
                // means results have been submitted
                const resultObj = {
                    ...testResult,
                    executionOrder: testResult.test.executionOrder,
                    testPlanRunId: testPlanRun.id,
                    tester: testPlanRun.tester
                };

                if (!tests[testResult.test.executionOrder])
                    tests[testResult.test.executionOrder] = [resultObj];
                else tests[testResult.test.executionOrder].push(resultObj);
            }
        });
    });

    // no conflicts to check if single result
    for (let key in tests) if (tests[key].length <= 1) delete tests[key];

    if (Object.keys(tests).length > 0) {
        for (let key in tests) {
            const testsToCheck = [...tests[key]]; // executionOrder id
            const baseTestToCheck = testsToCheck[0];
            const baseTester = baseTestToCheck.tester;
            const otherTestsToCheck = testsToCheck.filter(
                r => r.tester.id !== baseTester.id
            );

            // TODO: Based on old implementation; works but complex. Simplify.
            const conflicts = [];
            for (
                let c = 0;
                c < baseTestToCheck.result.resultsJSON.details.commands.length;
                c++
            ) {
                let baseCommand =
                    baseTestToCheck.result.resultsJSON.details.commands[c];

                for (let a = 0; a < baseCommand.assertions.length; a++) {
                    let baseAssertion = baseCommand.assertions[a];
                    let baseAnswer = baseAssertion.fail
                        ? `FAILED: ${baseAssertion.fail}`
                        : `PASSED: ${baseAssertion.pass}`;

                    const differentAnswers = [];

                    for (let otherTest of otherTestsToCheck) {
                        let otherCommand =
                            otherTest.result.resultsJSON.details.commands[c];
                        let otherAssertion = otherCommand.assertions[a];
                        let otherAnswer = otherAssertion.fail
                            ? `FAILED: ${otherAssertion.fail}`
                            : `PASSED: ${otherAssertion.pass}`;

                        if (baseAnswer !== otherAnswer) {
                            differentAnswers.push({
                                output: otherCommand.output,
                                answer: otherAnswer,
                                tester: otherTest.tester
                            });
                        }
                    }

                    if (differentAnswers.length) {
                        conflicts.push({
                            command: baseCommand.command,
                            assertion: baseAssertion.assertion,
                            answers: [
                                {
                                    output: baseCommand.output,
                                    answer: baseAnswer,
                                    tester: baseTester
                                },
                                ...differentAnswers
                            ]
                        });
                    }
                }

                const differentAnswers = [];
                for (let otherResult of otherTestsToCheck) {
                    let otherCommand =
                        otherResult.result.resultsJSON.details.commands[c];

                    // If the "unexpected_behaviors" list has different lengths, then
                    // they are different.
                    if (
                        baseCommand.unexpected_behaviors.length !==
                        otherCommand.unexpected_behaviors.length
                    ) {
                        differentAnswers.push({
                            output: otherCommand.output,
                            answer: otherCommand.unexpected_behaviors.length
                                ? otherCommand.unexpected_behaviors.join(
                                      ' and '
                                  )
                                : 'No unexpected behaviors recorded',
                            tester: otherResult.tester
                        });
                    }
                    // If they are the same length, confirm they are the same
                    // unexpected behaviors
                    else {
                        for (let ub of baseCommand.unexpected_behaviors) {
                            if (
                                otherCommand.unexpected_behaviors.indexOf(ub) >=
                                0
                            ) {
                                differentAnswers.push({
                                    output: otherCommand.output,
                                    answer: otherCommand.unexpected_behaviors
                                        .length
                                        ? otherCommand.unexpected_behaviors.join(
                                              ' and '
                                          )
                                        : 'No unexpected behaviors recorded',
                                    tester: otherResult.tester
                                });
                                // If we find any conflicts in the unexpected list, then the lists conflict
                                break;
                            }
                        }
                    }

                    if (differentAnswers.length) {
                        conflicts.push({
                            command: baseCommand.command,
                            unexpected_behavior: true,
                            answers: [
                                {
                                    output: baseCommand.output,
                                    answer: baseCommand.unexpected_behaviors
                                        .length
                                        ? baseCommand.unexpected_behaviors.join(
                                              ' and '
                                          )
                                        : 'No unexpected behaviors recorded',
                                    tester: baseTester
                                },
                                ...differentAnswers
                            ]
                        });
                    }
                }
            }

            conflictsResult[key] = conflicts;
        }
    }

    return conflictsResult;
};

module.exports = conflictsResolver;
