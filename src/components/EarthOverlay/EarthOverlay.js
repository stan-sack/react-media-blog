import React from 'react';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EarthOverlay.css';

class EarthOverlay extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {};
  }

  componentDidMount(){
    this.updateCanvas()
  }
  componentDidUpdate(){
    this.updateCanvas()
  }
  updateCanvas() {
        const ctx = this.refs.canvas.getContext('2d');
        ctx.fillStyle="#FF0000";
        ctx.fillRect(10,10, 100, 100);
    }

  render() {
    return(
      <canvas ref="canvas"
        width={this.props.width}
        height={this.props.height}
        className={s.ui}/>
    );
  }
}



export default withStyles(s)(EarthOverlay);
