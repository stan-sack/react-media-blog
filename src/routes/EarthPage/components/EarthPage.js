import React from 'react'
import PropTypes from 'prop-types'
import Earth from 'components/Earth'
import { ANIMATION_FPS } from '../../../constants/ThreeGeomerty'
import { KEY_CODES } from '../../../constants/Meta'
import Hammer from 'react-hammerjs'
// import EarthOverlay from 'components/EarthOverlay'

class EarthPage extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.updateDimensions = () => {
      this.props.updateWindowSize(window.innerWidth, window.innerHeight)
    //   this.props.initialiseVelocityCentre(window.innerWidth, window.innerHeight)
    }
    this.updateTouchEnabled = () => {
      this.props.updateTouchEnabled(true)
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.updateDimensions)
    window.addEventListener('touchstart', this.updateTouchEnabled)
    document.addEventListener('keydown', this.handleKeyPress, false)
    this.props.updateWindowSize(window.innerWidth, window.innerHeight)
    // this.props.initialiseVelocityCentre(window.innerWidth, window.innerHeight)
    this.refs.earthContainer.addEventListener('mousewheel', this.handleMouseScroll, false)
    this.refs.earthContainer.addEventListener('DOMMouseScroll', this.handleMouseScroll, false)
    this.refs.earthContainer.addEventListener('dragstart', this.handleMouseDrag, false)
    this.refs.earthContainer.addEventListener('drag', this.handleMouseDrag, false)
    this.refs.earthContainer.addEventListener('dragend', this.handleMouseDrag, false)
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions)
    clearInterval(this.ticker)
  }
  intervalTrigger = (renderTrigger) => {
    // this.renderTrigger = renderTrigger
    this.ticker = setInterval(() => {
      this.props.calculateNextFrame(this.props)
      renderTrigger()
    }, ANIMATION_FPS)
  }
  handleKeyPress = (event) => {
    if (event.keyCode === KEY_CODES.RIGHT_ARROW) {
      this.props.updateControlState('switchingFocus')
      this.props.focusNext(this.props.cameraPosition, this.props.locations, this.props.earthRotation)
    } else if (event.keyCode === KEY_CODES.LEFT_ARROW) {
      this.props.updateControlState('switchingFocus')
      this.props.focusPrevious(this.props.cameraPosition, this.props.locations, this.props.earthRotation)
    }
  }
  handleMouseScroll = (event) => {
    event.preventDefault()
    this.props.updateCameraDistance(event.deltaY, this.props.cameraDistance, false)
  }
  handleMouseDrag = (event) => {
    if (event.type === 'dragstart') {
      this.props.updateVelocityPair(event.screenX, this.props.height - event.screenY)
      this.props.updateVelocityPair(event.screenX, this.props.height - event.screenY)
      this.props.updateControlState('drag')
    } else if (event.type === 'drag' && (event.screenX && event.screenY !== 0)) {
      if (!(event.screenX === this.props.twoDimensionalVelocityPair[1].x &&
          this.props.height - event.screenY === this.props.twoDimensionalVelocityPair[1].y)) {
        this.props.updateVelocityPair(event.screenX, this.props.height - event.screenY)
      }
    } else if (event.type === 'dragend') {
      this.props.updateControlState('rolling')
    }
  }
  handleSwipe = (event) => {
    this.props.updateVelocityPair(0, 0)
    this.props.updateVelocityPair(
        event.deltaX / (event.deltaTime * 0.5),
        -event.deltaY / (0.5 * event.deltaTime)
    )
    this.props.updateControlState('rolling')
  }
  handlePinch = (event) => {
    if (event.overallVelocity > 0.05 || event.overallVelocity < -0.05) {
      this.props.updateCameraDistance(event, this.props.cameraDistance, true)
    }
  }
  addTouchControls = (isTouch) => {
    if (isTouch) {
      return (
        <Hammer
          onSwipe={this.handleSwipe}
          onPinch={this.handlePinch}
          direction={'DIRECTION_ALL'}
          options={{ recognizers: {
            pinch: { enable: true },
            rotate: { enable: true }
          } }}>
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
        </Hammer>
      )
    } else {
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
  render () {
    return (
      this.addTouchControls(this.props.touchEnabled)
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
  updateWindowSize: PropTypes.func,
  updateControlState: PropTypes.func,
  earthRotation: PropTypes.object,
  updateVelocityPair: PropTypes.func,
  twoDimensionalVelocityPair: PropTypes.array,
  updateTouchEnabled: PropTypes.func,
  focusNext: PropTypes.func,
  focusPrevious: PropTypes.func,
  touchEnabled: PropTypes.bool
}

export default EarthPage
