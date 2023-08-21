import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Feedback } from '..';
import { Form } from 'react-bootstrap';
import { noOutputTextAreaValue } from './constants';

const OutputTextAreaWrapper = styled.div`
    > textarea {
        width: 100%;
    }
`;

const NoOutputCheckbox = styled(Form.Check)`
    display: inline-block;
    float: right;
    color: ${props => (props.disabled ? 'lightgray' : 'inherit')};
    > input {
        cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
        margin-right: 4px;
    }
`;

const OutputTextArea = ({ commandIndex, atOutput, isSubmitted }) => {
    const [noOutput, setNoOutput] = React.useState(
        atOutput.value === noOutputTextAreaValue
    );

    useEffect(() => {
        if (noOutput) {
            atOutput.change(noOutputTextAreaValue);
        } else {
            atOutput.change('');
        }
    }, [noOutput]);

    return (
        <OutputTextAreaWrapper>
            <label htmlFor={`speechoutput-${commandIndex}`}>
                {atOutput.description[0]}
                {isSubmitted && (
                    <Feedback
                        className={`${
                            atOutput.description[1].required && 'required'
                        } ${
                            atOutput.description[1].highlightRequired &&
                            'highlight-required'
                        }`}
                    >
                        {atOutput.description[1].description}
                    </Feedback>
                )}
            </label>
            <NoOutputCheckbox
                aria-checked={noOutput}
                disabled={
                    atOutput.value && atOutput.value !== noOutputTextAreaValue
                }
                label="No output"
                id={`no-output-checkbox-${commandIndex}`}
                type="checkbox"
                onChange={() => setNoOutput(!noOutput)}
            />
            <textarea
                key={`SpeechOutput__textarea__${commandIndex}`}
                id={`speechoutput-${commandIndex}`}
                autoFocus={isSubmitted && atOutput.focus}
                value={atOutput.value}
                onChange={e => atOutput.change(e.target.value)}
                disabled={noOutput}
            />
        </OutputTextAreaWrapper>
    );
};

OutputTextArea.propTypes = {
    commandIndex: PropTypes.number.isRequired,
    atOutput: PropTypes.object.isRequired,
    isSubmitted: PropTypes.bool.isRequired
};

export default OutputTextArea;
