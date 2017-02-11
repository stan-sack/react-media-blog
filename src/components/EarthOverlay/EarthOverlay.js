import React from 'react';
import FontAwesome from 'react-fontawesome';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EarthOverlay.css';

class EarthOverlay extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {};
  }

  componentDidMount() {
    // this.updateCanvas()
  }
  componentDidUpdate() {
    // this.updateCanvas()
  }
  getArrows() {
    if (this.props.width / this.props.height > 2) {
      return (
        <div className={s.ui}>
          <div className={s.arrowWrapper}>
            <FontAwesome
              className={s.arrow}
              name="arrow-left"
              size="5x"
            />
          </div>
          <div className={s.midspace} />
          <div className={s.arrowWrapper}>
            <FontAwesome
              className={s.arrow}
              name="arrow-right"
              size="5x"
            />
          </div>
        </div>
      );
    }
    return (
      <div className={s.ui}>
        <div className={s.doubleArrowWrapper}>
          <FontAwesome
            className={s.doubleArrow}
            name="arrows-h"
            size="5x"
          />
        </div>
      </div>
    );
  }

  render() {
    return (this.getArrows());
  }
}


export default withStyles(s)(EarthOverlay);
