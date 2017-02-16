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
      this.props.updateWindowSize(window.innerWidth, window.innerHeight)
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.updateDimensions)
    this.props.updateWindowSize(window.innerWidth, window.innerHeight)
    this.refs.earthContainer.addEventListener('mousewheel', this.handleMouseScroll, false)
    this.refs.earthContainer.addEventListener('DOMMouseScroll', this.handleMouseScroll, false)
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions)
    clearInterval(this.ticker)
  }
  intervalTrigger = (renderTrigger) => {
    this.ticker = setInterval(() => {
      this.props.calculateNextFrame(this.props)
      renderTrigger()
    }, ANIMATION_FPS)
  }
  handleMouseScroll = (event) => {
    event.preventDefault()
    console.log('scrolling')
  }
  render () {
    return (
      <div ref='earthContainer'>
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
  updateWindowSize: PropTypes.func,
  renderTrigger: PropTypes.func
}

export default EarthPage
