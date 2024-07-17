import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const NavigationMenu = ({ className, children }) => {
  const menuClasses = classNames(
    'd-flex',          // Always flex container
    'lg-flex',         // Applies lg:flex behavior
    'ml-auto',         // Applies ml-auto behavior
    className          // Additional classes passed as props
  );

  return (
    <div className={menuClasses}>
      {children}
    </div>
  );
};

NavigationMenu.propTypes = {
  className: PropTypes.string, // Additional classes for customization
  children: PropTypes.node // Menu items or links as children
};

export default NavigationMenu;
