import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const NavigationMenuList = ({ className, children }) => {
  const listClasses = classNames(
    'list-unstyled',  // Bootstrap utility class for list styles
    className         // Additional classes passed as props
  );

  return (
    <ul className={listClasses}>
      {children}
    </ul>
  );
};

NavigationMenuList.propTypes = {
  className: PropTypes.string, // Additional classes for customization
  children: PropTypes.node // Menu items or links as children
};

export default NavigationMenuList;
