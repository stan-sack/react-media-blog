import React from 'react'
import PropTypes from 'prop-types'
import FontAwesome from 'react-fontawesome'
import './EarthOverlay.scss'

class EarthOverlay extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number
  }

  constructor (props, context) {
    super(props, context)
    this.state = {}
  }

  componentDidMount () {
    // this.updateCanvas()
  }
  componentDidUpdate () {
    // this.updateCanvas()
  }
  getArrows () {
    if (this.props.width / this.props.height > 2) {
      return (
        <div className={'ui'}>
          <div className={'arrowWrapper'}>
            <FontAwesome
              className={'arrow'}
              name='arrow-left'
              size='5x'
            />
          </div>
          <div className={'midspace'} />
          <div className={'arrowWrapper'}>
            <FontAwesome
              className={'arrow'}
              name='arrow-right'
              size='5x'
            />
          </div>
        </div>
      )
    }
    return (
      <div className={'ui'}>
        <div className={'doubleArrowWrapper'}>
          <FontAwesome
            className={'doubleArrow'}
            name='arrows-h'
            size='5x'
          />
        </div>
      </div>
    )
  }

  render () {
    return (this.getArrows())
  }
}
export default (EarthOverlay)
