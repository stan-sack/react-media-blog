import * as THREE from 'three'
import { getTravelPath, getPathToNextFocus, getPathToPreviousFocus,
  convertLatLonToVec3, compressDuplicateLocations,
  getPathToNearestFocus } from '../../../helpers/geometryHelpers'
import { EARTH_RADIUS, ACCELERATION } from '../../../constants/ThreeGeomerty'
// ------------------------------------
// Constants
// ------------------------------------
export const UPDATE_ANIMATION = 'UPDATE_ANIMATION'
export const UPDATE_WINDOW_SIZE = 'UPDATE_WINDOW_SIZE'
export const SET_MANUAL_RENDER_TRIGGER = 'SET_MANUAL_RENDER_TRIGGER'
export const UPDATE_CAMERA_DISTACE = 'UPDATE_CAMERA_DISTACE'
export const UPDATE_CONTROL_STATE = 'UPDATE_CONTROL_STATE'
export const INITIALISE_VELOCITY_CENTRE = 'INITIALISE_VELOCITY_CENTRE'
export const UPDATE_VELOCITY_PAIR = 'UPDATE_VELOCITY_PAIR'
export const UPDATE_TOUCH_ENABLED = 'UPDATE_TOUCH_ENABLED'
export const INJECT_FACEBOOK_PHOTOS = 'INJECT_FACEBOOK_PHOTOS'
export const FOCUS_NEXT = 'FOCUS_NEXT'
export const FOCUS_PREVIOUS = 'FOCUS_PREVIOUS'
export const FOCUS_NEAREST = 'FOCUS_NEAREST'

// ------------------------------------
// Actions
// ------------------------------------
// export function increment (value = 1) {
//   return {
//     // type    : COUNTER_INCREMENT,
//     // payload : value
//   }
// }

/*  This is a thunk, meaning it is a function that immediately
returns a function for lazy evaluation. It is incredibly useful for
creating async actions, especially when combined with redux-thunk! */

export const calculateNextFrame = (props) => {
  let nextPrimaryMarkerPosition
  let newEarthRotation = props.earthRotation
  let newCameraPosition = props.cameraPosition.normalize().multiplyScalar(props.cameraDistance)
  let newVelocityScalar = 0.01
  let newControlState = props.controlState
  let newFocusPath = props.focusPath

  // we will get this callback every frame
  if (props.controlState === 'auto') {
    let currentPos = props.travelPath[props.primaryMarkerPosition].clone().normalize()
    let camToCurrentPos = new THREE.Quaternion().setFromUnitVectors(currentPos, newCameraPosition.clone().normalize())
    newEarthRotation = camToCurrentPos.clone()
  } else if (props.controlState === 'drag') {
    let rotationDirection = new THREE.Vector3(
      props.twoDimensionalVelocityPair[1].x - props.twoDimensionalVelocityPair[0].x,
      props.twoDimensionalVelocityPair[1].y - props.twoDimensionalVelocityPair[0].y,
      0
    )
    let angle = rotationDirection.length() * newVelocityScalar
    let rotationAxis = newCameraPosition.clone()
    let normal = rotationDirection.clone().normalize()
    normal.cross(rotationAxis).normalize().applyQuaternion(props.earthRotation.clone().inverse())
    let quaternion = new THREE.Quaternion().setFromAxisAngle(normal, -angle)
    newEarthRotation = props.earthRotation.clone().normalize().multiply(quaternion)
    nextPrimaryMarkerPosition = props.primaryMarkerPosition
  } else if (props.controlState === 'rolling') {
    let rotationDirection = new THREE.Vector3(
      props.twoDimensionalVelocityPair[1].x - props.twoDimensionalVelocityPair[0].x,
      props.twoDimensionalVelocityPair[1].y - props.twoDimensionalVelocityPair[0].y,
      0
    )
    newVelocityScalar = props.velocityScalar - ACCELERATION
    let angle = rotationDirection.length() * (newVelocityScalar)
    let rotationAxis = newCameraPosition.clone()
    let normal = rotationDirection.clone().normalize()
    normal.cross(rotationAxis).normalize().applyQuaternion(props.earthRotation.clone().inverse())
    let quaternion = new THREE.Quaternion().setFromAxisAngle(normal, -angle)
    newEarthRotation = props.earthRotation.clone().multiply(quaternion)
    if (newVelocityScalar < 0.0002) {
      newControlState = 'slowRotate'
    }
  } else if (props.controlState === 'slowRotate') {
    let normal = new THREE.Vector3(0, 1, 0).applyQuaternion(props.earthRotation.clone().inverse())
    let angle = 0.001
    let quaternion = new THREE.Quaternion().setFromAxisAngle(normal, -angle)
    newEarthRotation = props.earthRotation.clone().multiply(quaternion)
  } else if (props.controlState === 'focus') {
    // do nothing here yet
  } else if (props.controlState === 'switchingFocus') {
    let currentPos = props.focusPath[1].clone()
    let camToCurrentPos = new THREE.Quaternion().setFromUnitVectors(currentPos, newCameraPosition.clone().normalize())
    newEarthRotation = camToCurrentPos.clone()

    newFocusPath = props.focusPath.slice(1)
    if (newFocusPath.length === 1) {
      newControlState = 'focus'
    }
  }

  nextPrimaryMarkerPosition = props.primaryMarkerPosition + 1
  if (props.primaryMarkerPosition >= props.travelPath.length - 1) {
    nextPrimaryMarkerPosition = 0
  } else if (typeof props.primaryMarkerPosition === 'undefined') {
    nextPrimaryMarkerPosition = 0
  }

  return {
    type    : UPDATE_ANIMATION,
    payload : {
      primaryMarkerPosition: nextPrimaryMarkerPosition,
      cameraPosition: newCameraPosition,
      earthRotation: newEarthRotation,
      velocityScalar: newVelocityScalar,
      controlState: newControlState,
      focusPath: newFocusPath
    }
  }
}

export const initialiseVelocityCentre = (windowWidth, windowHeight) => {
  return {
    type    : INITIALISE_VELOCITY_CENTRE,
    payload : [
      {
        x: windowWidth / 2,
        y: windowHeight / 2
      },
      {
        x: windowWidth / 2,
        y: windowHeight / 2
      }
    ]
  }
}

export const focusNext = (currentPos, locations, earthRotation) => {
  let path = getPathToNextFocus(currentPos, locations, earthRotation)
  return {
    type: FOCUS_NEXT,
    payload: {
      focusPath: path,
      controlState: 'switchingFocus'
    }
  }
}

export const focusPrevious = (currentPos, locations, earthRotation) => {
  let path = getPathToPreviousFocus(currentPos, locations, earthRotation)
  return {
    type: FOCUS_PREVIOUS,
    payload: {
      focusPath: path,
      controlState: 'switchingFocus'
    }
  }
}

export const focusNearest = (currentPos, locations, earthRotation) => {
  let path = getPathToNearestFocus(currentPos, locations, earthRotation)
  return {
    type: FOCUS_NEAREST,
    payload: {
      focusPath: path,
      controlState: 'switchingFocus'
    }
  }
}

export const updateVelocityPair = (cursorX, cursorY, props) => {
  return {
    type: UPDATE_VELOCITY_PAIR,
    payload: {
      x: cursorX,
      y: cursorY
    }
  }
}

export const updateTouchEnabled = (isTouch) => {
  return {
    type: UPDATE_TOUCH_ENABLED,
    payload: isTouch
  }
}

export const updateCameraDistance = (data, cameraDistance, isPinch) => {
  let newCameraDistance
  if (!isPinch) {
    if (data > 0) {
      newCameraDistance = cameraDistance + 0.1
    } else {
      newCameraDistance = Math.max(cameraDistance - 0.1, EARTH_RADIUS + 0.1)
    }
  } else {
    // TODO: implement some kind of smoothing here
    if (data.additionalEvent === 'pinchin') {
      newCameraDistance = cameraDistance + data.velocity
    } else {
      // TODO: data.velocity may already be negative when pinchout
      newCameraDistance = Math.max(cameraDistance + data.velocity, EARTH_RADIUS + 0.1)
    }
  }

  return {
    type    : UPDATE_CAMERA_DISTACE,
    payload : newCameraDistance
  }
}

export const updateWindowSize = (width, height) => {
  return {
    type    : UPDATE_WINDOW_SIZE,
    payload : {
      width: width,
      height: Math.floor(height * 0.9)
    }
  }
}

export const setManualRenderTrigger = (renderTrigger) => {
  return {
    type    : SET_MANUAL_RENDER_TRIGGER,
    payload : renderTrigger
  }
}

export const updateControlState = (newState) => {
  return {
    type    : UPDATE_CONTROL_STATE,
    payload : newState
  }
}

export const injectFacebookPhotos = (newLocations) => {
  newLocations = compressDuplicateLocations(newLocations)
  return {
    type    : INJECT_FACEBOOK_PHOTOS,
    payload : {
      locations: newLocations,
      travelPath: getTravelPath(newLocations)
    }
  }
}

export const fetchFacebookPhotos = () => {
  return (dispatch) => {
    return (
      fetch('https://1lf6gan537.execute-api.ap-southeast-2.amazonaws.com/dev/fb/photos')
      .then((response) => response.json())
      .then((json) => Promise.all(json.photos.map((photo) => {
        return {
          dest: photo.caption,
          lat: photo.location.latitude,
          lon: photo.location.longitude,
          angle: convertLatLonToVec3(photo.location.latitude, photo.location.longitude).normalize(),
          content: [{
            text: photo.caption
            // photo: fetch('http://nemanjakovacevic.net/wp-content/uploads/2013/07/placeholder.png')
          }]
        }
      })))
      // inject last 20 posts
      .then((locations) => dispatch(injectFacebookPhotos(locations.slice(Math.max(locations.length - 20, 1)))))
      .catch((error) => {})
    )
  }
}

export const fetchAllData = () => {
  return (dispatch) => {
    Promise.all([
      dispatch(fetchFacebookPhotos())
    ])
    .then(() => dispatch(updateControlState('auto')))
  }
}

// export const actions = {
//   calculateNextFrame,
//   updateWindowSize,
//   setManualRenderTrigger,
//   updateCameraDistance,
//   updateControlState,
//   updateTouchEnabled,
//   updateVelocityPair,
//   fetchAllData
// }

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [UPDATE_ANIMATION]: (state, action) => {
    return Object.assign({}, state, {
      primaryMarkerPosition: action.payload.primaryMarkerPosition,
      cameraPosition: action.payload.cameraPosition,
      earthRotation: action.payload.earthRotation,
      velocityScalar: action.payload.velocityScalar,
      controlState: action.payload.controlState,
      focusPath: action.payload.focusPath
    })
  },
  [UPDATE_WINDOW_SIZE]: (state, action) => {
    return Object.assign({}, state, {
      width: action.payload.width,
      height: action.payload.height
    })
  },
  [SET_MANUAL_RENDER_TRIGGER]: (state, action) => {
    return Object.assign({}, state, {
      renderTrigger: action.payload
    })
  },
  [UPDATE_CAMERA_DISTACE]: (state, action) => {
    return Object.assign({}, state, {
      cameraDistance: action.payload
    })
  },
  [INITIALISE_VELOCITY_CENTRE]: (state, action) => {
    return Object.assign({}, state, {
      twoDimensionalVelocityPair: action.payload
    })
  },
  [UPDATE_VELOCITY_PAIR]: (state, action) => {
    return Object.assign({}, state, {
      twoDimensionalVelocityPair: [
        state.twoDimensionalVelocityPair[1], action.payload
      ]
    })
  },
  [UPDATE_TOUCH_ENABLED]: (state, action) => {
    return Object.assign({}, state, {
      touchEnabled: action.payload
    })
  },
  [UPDATE_CONTROL_STATE]: (state, action) => {
    return Object.assign({}, state, {
      controlState: action.payload
    })
  },
  [INJECT_FACEBOOK_PHOTOS]: (state, action) => {
    return Object.assign({}, state, {
      travelPath: action.payload.travelPath,
      locations: action.payload.locations
    })
  },
  [FOCUS_NEXT]: (state, action) => {
    return Object.assign({}, state, {
      focusPath: action.payload.focusPath,
      controlState: action.payload.controlState
    })
  },
  [FOCUS_PREVIOUS]: (state, action) => {
    return Object.assign({}, state, {
      focusPath: action.payload.focusPath,
      controlState: action.payload.controlState
    })
  },
  [FOCUS_NEAREST]: (state, action) => {
    return Object.assign({}, state, {
      focusPath: action.payload.focusPath,
      controlState: action.payload.controlState
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

// let tempLocations = [
//   { dest: 'Adelaide', lat: -34.9288, lon: 138.6007 },
//   { dest: 'Sydney', lat: -33.8688, lon: 151.2093 },
//   { dest: 'Ulaanbaatar', lat: 47.8864, lon: 106.9057 },
//   { dest: 'Berlin', lat: 52.5200, lon: 13.4050 },
//   { dest: 'Amsterdam', lat: 52.3702, lon: 4.8952 },
//   { dest: 'New York', lat: 40.7128, lon: -74.0059 },
//   { dest: 'AdelaideHome', lat: -34.9288, lon: 138.6007 }
// ]

// let temp = getTravelPath(tempLocations)

const initialState = {
  width: 0,
  height: 0,
  primaryMarkerPosition: 0,
  locations: [],
  travelPath: [],
  focusPath: [],
  earthRotation: new THREE.Quaternion(),
  cameraDistance: 2,
  cameraPosition: new THREE.Vector3(0, 0, 2),
  lightPosition: new THREE.Vector3(0.5, 0.5, 1),
  controlState: 'slowRotate',
  twoDimensionalVelocityPair: [
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ],
  velocityScalar: 0.01,
  touchEnabled: false
}
export default function earthPageReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
