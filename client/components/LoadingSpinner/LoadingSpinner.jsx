import React from 'react';
import './LoadingSpinner.css';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ percentage = null }) => {
    return (
        <div className="spinner-container">
            {percentage === null ? null : (
                <div tabIndex={0} className="percentage">
                    {percentage}%
                </div>
            )}

            <svg className="spinner" viewBox="0 0 50 50">
                <circle
                    className="path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="3"
                ></circle>
            </svg>
        </div>
    );
};

LoadingSpinner.propTypes = {
    percentage: PropTypes.number
};

export default LoadingSpinner;
