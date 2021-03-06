import React from 'react';
import propTypes from 'prop-types';

class FlashMessage extends React.Component {

  handleClick = () => {
    this.props.clearFlashMessage()
  }

  render() {
    const { type, text } = this.props.message;
    return (
      <div className={`${type === 'error' ? 'ui error' : 'ui info'} message flashMessage`}>
        <i onClick={this.handleClick} className="close icon"></i>
        <div className="header">
          {text.header}
        </div>
        <p>
          {text.message}
        </p>
      </div>
    );
  }
}

FlashMessage.propTypes = {
  message: propTypes.object.isRequired,
  clearFlashMessage: propTypes.func.isRequired
}

export default FlashMessage;
