import React from 'react';
import PropTypes from 'prop-types';
import './CardWeekCalendar.less';
const CardWeekCalendar = ( {children, onMouseOver, onMouseLeave} ) => {

  return (
    <div className="tk_CardWeekCalendar" onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  );
};

CardWeekCalendar.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  disabled: PropTypes.bool,
  onMouseOver: PropTypes.func,
  onMouseLeave: PropTypes.func
};



export default CardWeekCalendar;