import React, { PropTypes } from 'react'
import Earth from 'components/Earth'
import { ANIMATION_FPS } from '../../../constants/ThreeGeomerty'

// import EarthOverlay from 'components/EarthOverlay'

class EarthPage extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.updateDimensions = () => {
      this.props.updateWindowSize(window.innerWidth, window.innerHeight)
      this.props.initialiseVelocityCentre(window.innerWidth, window.innerHeight)
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.updateDimensions)
    this.props.updateWindowSize(window.innerWidth, window.innerHeight)
    this.props.initialiseVelocityCentre(window.innerWidth, window.innerHeight)
    this.refs.earthContainer.addEventListener('mousewheel', this.handleMouseScroll, false)
    this.refs.earthContainer.addEventListener('DOMMouseScroll', this.handleMouseScroll, false)
    this.refs.earthContainer.addEventListener('dragstart', this.handleMouseDrag, false)
    this.refs.earthContainer.addEventListener('drag', this.handleMouseDrag, false)
    this.refs.earthContainer.addEventListener('dragend', this.handleMouseDrag, false)
    this.refs.earthContainer.addEventListener('onmousemove', this.handleMouseMove, false)
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
    this.props.updateCameraDistance(event.deltaY, this.props.cameraDistance)
  }
  handleMouseDrag = (event) => {
    if (event.type === 'dragstart') {
      this.props.updateControlState('drag')
    } else if (event.type === 'drag' && (event.screenX && event.screenY !== 0)) {
      this.props.updateVelocity(event.screenX, this.props.height - event.screenY)
    } else if (event.type === 'dragend') {
      this.props.updateControlState('slowRotate')
    }
  }
  render () {
    return (
      <div ref='earthContainer' draggable='true'>
        <Earth
          width={this.props.width}
          height={this.props.height}
          primaryMarkerPosition={this.props.primaryMarkerPosition}
          travelPath={this.props.travelPath}
          comet={this.props.comet}
          cameraPosition={this.props.cameraPosition}
          lightPosition={this.props.lightPosition}
          locations={this.props.locations}
          earthRotation={this.props.earthRotation}
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
  cameraDistance: PropTypes.number,
  updateCameraDistance: PropTypes.func,
  locations: PropTypes.array,
  setManualRenderTrigger: PropTypes.func,
  updateWindowSize: PropTypes.func,
  renderTrigger: PropTypes.func,
  controlState: PropTypes.string,
  updateControlState: PropTypes.func,
  earthRotation: PropTypes.object,
  initialiseVelocityCentre: PropTypes.func,
  updateVelocity: PropTypes.func,
  twoDimensionalVelocity: PropTypes.array
}

export default EarthPage
