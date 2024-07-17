import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const NavigationMenuLink = ({ className, href, children }) => {
  const linkClasses = classNames(
    'nav-link',   // Bootstrap utility class for nav links
    className     // Additional classes passed as props
  );

  return (
    <li className="nav-item">
      <a href={href} className={linkClasses}>
        {children}
      </a>
    </li>
  );
};

NavigationMenuLink.propTypes = {
  className: PropTypes.string, // Additional classes for customization
  href: PropTypes.string.isRequired, // Href for the link
  children: PropTypes.node // Text or components inside the link
};

export default NavigationMenuLink;
