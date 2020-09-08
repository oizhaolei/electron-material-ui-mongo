import React from 'react';
import PropTypes from 'prop-types';

export default function AppTheme(props) {
  const { children } = props;

  return (
    <>
      <meta name="robots" content="noindex,nofollow" />
      {children}
    </>
  );
}

AppTheme.propTypes = {
  children: PropTypes.element.isRequired,
};
