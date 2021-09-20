import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import formatConflictsAsText from '../../../utils/formatConflictsAsText';
import nextId from 'react-id-generator';

const ReviewConflictsModal = ({
    show = false,
    userId,
    conflicts = [],
    handleClose = () => {},
    handleRaiseIssueButtonClick = () => {}
}) => {
    const renderModalBody = () => {
        return conflicts.map((conflict, index) => {
            if (conflict.assertion) {
                let currentUsername = '';
                let yourAnswer = conflict.answers.find(a => {
                    if (a.tester.id == userId) {
                        currentUsername = a.tester.username;
                        return true;
                    }
                });
                let otherAnswers = conflict.answers.filter(
                    a => a.tester.id != userId
                );

                return (
                    <Fragment key={nextId()}>
                        <h5>{`Difference ${index + 1} - Testing command "${
                            conflict.command
                        }" for assertion "${conflict.assertion}"`}</h5>
                        <ul>
                            <li>
                                {`${currentUsername}'s result: ${
                                    yourAnswer ? yourAnswer.answer : 'N/A'
                                } (for output "${
                                    yourAnswer ? yourAnswer.output : 'N/A'
                                }")`}
                            </li>
                            {otherAnswers.map(answer => {
                                let other = answer.tester.username;
                                return (
                                    <li key={nextId()}>
                                        {`${other}'s result: ${answer.answer} (for output "${answer.output}")`}
                                    </li>
                                );
                            })}
                        </ul>
                    </Fragment>
                );
            } else {
                let currentUsername = '';
                let yourUnexpected = conflict.answers.find(a => {
                    if (a.tester.id == userId) {
                        currentUsername = a.tester.username;
                        return true;
                    }
                });
                let otherUnexpecteds = conflict.answers.filter(
                    a => a.tester.id != userId
                );
                return (
                    <Fragment key={nextId()}>
                        <h5>{`Difference ${index +
                            1} - Unexpected behavior when testing command "${
                            conflict.command
                        }"`}</h5>
                        <ul>
                            <li>
                                {`${currentUsername}'s result: ${
                                    yourUnexpected
                                        ? yourUnexpected.answer
                                        : 'N/A'
                                } (for output "${
                                    yourUnexpected
                                        ? yourUnexpected.output
                                        : 'N/A'
                                }")`}
                            </li>
                            {otherUnexpecteds.map(answer => {
                                let other = answer.tester.username;
                                return (
                                    <li key={nextId()}>
                                        {`${other}'s result: ${answer.answer} (for output "${answer.output}")`}
                                    </li>
                                );
                            })}
                        </ul>
                    </Fragment>
                );
            }
        });
    };

    const conflictsText = formatConflictsAsText(conflicts, userId);
    const modalBody = renderModalBody(conflicts);

    return (
        <Modal
            show={show}
            role="dialog"
            tabIndex={-1}
            keyboard
            scrollable
            dialogClassName="modal-xl"
            aria-modal="true"
            aria-labelledby="review-conflicts-modal"
            onHide={handleClose}
        >
            <Modal.Header closeButton>
                <Modal.Title id="review-conflicts-modal-title">
                    {`Reviewing ${conflicts.length} Conflicts`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalBody}</Modal.Body>
            <Modal.Footer>
                <CopyToClipboard text={conflictsText}>
                    <Button variant="secondary">
                        Copy Conflicts to Clipboard
                    </Button>
                </CopyToClipboard>
                <Button
                    variant="secondary"
                    onClick={handleRaiseIssueButtonClick}
                >
                    Raise an Issue for Conflict
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

ReviewConflictsModal.propTypes = {
    show: PropTypes.bool,
    userId: PropTypes.any,
    conflicts: PropTypes.array,
    handleClose: PropTypes.func,
    handleRaiseIssueButtonClick: PropTypes.func
};

export default ReviewConflictsModal;
