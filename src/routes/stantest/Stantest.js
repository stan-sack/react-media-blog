/**
* React Starter Kit (https://www.reactstarterkit.com/)
*
* Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE.txt file in the root directory of this source tree.
*/

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Stantest.css';
import Earth from '../../components/Earth';
import EarthOverlay from '../../components/EarthOverlay';

class Stantest extends React.Component {
  static propTypes = {};
  constructor(props, context) {
    super(props, context);
    this.state = {
      height: 300,
      width: 300
    }
    this.updateDimensions = () => {
      this.setState({
        height: window.innerHeight,
        width: window.innerWidth
      });
    }
  }

  componentDidMount(){
    window.addEventListener("resize", this.updateDimensions);
    this.setState({
      height: window.innerHeight,
      width: window.innerWidth
    });
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
    return (
      <div>
        <EarthOverlay height={this.state.height} width={this.state.width}/>
        <Earth height={this.state.height} width={this.state.width}/>
      </div>
    );
  }
}

export default withStyles(s)(Stantest);
