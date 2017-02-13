import React, { PropTypes } from 'react'
import Earth from 'components/Earth'
import { store } from '../../../main'
import { ANIMATION_FPS } from '../../../constants/ThreeGeomerty'
import { updateWindowSize, calculateNextFrame } from '../modules/earthPage'

// import EarthOverlay from 'components/EarthOverlay'

class EarthPage extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.updateDimensions = () => {
      store.dispatch(updateWindowSize(document.body.clientWidth, document.body.clientHeight))
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.updateDimensions)
    store.dispatch(updateWindowSize(document.body.clientWidth, document.body.clientHeight))
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions)
    clearInterval(this.ticker)
  }
  intervalTrigger = (renderTrigger) => {
    this.ticker = setInterval(function () {
      store.dispatch(calculateNextFrame(this.props))
      renderTrigger()
    }.bind(this), ANIMATION_FPS)
  }

  render () {
    return (
      <div style={{ margin: '0 auto' }} >
        <Earth
          width={this.props.width}
          height={this.props.height}
          primaryMarkerPosition={this.props.primaryMarkerPosition}
          travelPath={this.props.travelPath}
          comet={this.props.comet}
          cameraPosition={this.props.cameraPosition}
          lightPosition={this.props.lightPosition}
          locations={this.props.locations}
          setManualRenderTrigger={this.intervalTrigger} />
      </div>
    )
  }
}

EarthPage.propTypes = {
  width : PropTypes.number,
  height : PropTypes.number,
  primaryMarkerPosition : PropTypes.number,
  travelPath : PropTypes.array,
  comet : PropTypes.array,
  cameraPosition: PropTypes.object,
  lightPosition: PropTypes.object,
  calculateNextFrame: PropTypes.func,
  locations: PropTypes.array,
  setManualRenderTrigger: PropTypes.func,
  renderTrigger: PropTypes.func
}

export default EarthPage
