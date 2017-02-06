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

class Stantest extends React.Component {
  static propTypes = {};

  render() {
    return (
      <div className={s.root}>
        <Earth />
      </div>
    );
  }
}

export default withStyles(s)(Stantest);
