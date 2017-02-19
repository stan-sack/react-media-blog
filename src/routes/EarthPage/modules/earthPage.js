import * as THREE from 'three'
import { getTravelPath, toEuler } from '../../../helpers/geometryHelpers'
import { EARTH_RADIUS } from '../../../constants/ThreeGeomerty'
// ------------------------------------
// Constants
// ------------------------------------
export const UPDATE_ANIMATION = 'UPDATE_ANIMATION'
export const UPDATE_WINDOW_SIZE = 'UPDATE_WINDOW_SIZE'
export const SET_MANUAL_RENDER_TRIGGER = 'SET_MANUAL_RENDER_TRIGGER'
export const UPDATE_CAMERA_DISTACE = 'UPDATE_CAMERA_DISTACE'
export const UPDATE_CONTROL_STATE = 'UPDATE_CONTROL_STATE'
export const INITIALISE_VELOCITY_CENTRE = 'INITIALISE_VELOCITY_CENTRE'
export const UPDATE_VELOCITY = 'UPDATE_VELOCITY'

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

  // we will get this callback every frame
  if (props.controlState === 'auto') {
    let currentPos = props.travelPath[props.primaryMarkerPosition].clone()
    let normal = currentPos.clone()
    normal.cross(newCameraPosition).normalize()
    let angle = newCameraPosition.angleTo(currentPos)
    let quaternion = new THREE.Quaternion().setFromAxisAngle(normal, angle)
    newEarthRotation = new THREE.Euler().setFromQuaternion(quaternion)

    // KEEP THIS CODE ITS FOR ROTATING THE CAMERA AND LIGHT!!!
    // let oldCam = props.cameraPosition.clone()
    // let currentPos = props.travelPath[props.primaryMarkerPosition].clone()
    // let newCam = newCameraPosition.clone()
    // let quaternion = new THREE.Quaternion().setFromUnitVectors(oldCam.normalize(), newCam.normalize())
    // let matrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion)
    // newLightPosition = props.lightPosition.clone()
    // newLightPosition.applyMatrix4(matrix)
  } else if (props.controlState === 'drag') {
    let rotationDirection = new THREE.Vector3(
      props.twoDimensionalVelocity[1].x - props.twoDimensionalVelocity[0].x,
      props.twoDimensionalVelocity[1].y - props.twoDimensionalVelocity[0].y,
      0
    )

    let angle = rotationDirection.length() * 0.01
    let rotationAxis = newCameraPosition.clone()
    let normal = rotationDirection.clone().normalize()
    normal.cross(rotationAxis).normalize()
    let quaternion = new THREE.Quaternion().setFromAxisAngle(normal, -angle)
    newEarthRotation = new THREE.Euler().setFromQuaternion(quaternion)
    newEarthRotation.x += props.earthRotation.x
    newEarthRotation.y += props.earthRotation.y
    newEarthRotation.z += props.earthRotation.z
    // nextPrimaryMarkerPosition = props.primaryMarkerPosition
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
      earthRotation: newEarthRotation
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

export const updateVelocity = (cursorX, cursorY) => {
  return {
    type: UPDATE_VELOCITY,
    payload: {
      x: cursorX,
      y: cursorY
    }
  }
}

export const updateCameraDistance = (deltaY, cameraDistance) => {
  let newCameraDistance
  if (deltaY > 0) {
    newCameraDistance = cameraDistance + 0.1
  } else {
    newCameraDistance = Math.max(cameraDistance - 0.1, EARTH_RADIUS + 0.1)
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

export const actions = {
  calculateNextFrame,
  updateWindowSize,
  setManualRenderTrigger,
  updateCameraDistance,
  updateControlState
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [UPDATE_ANIMATION]: (state, action) => {
    return Object.assign({}, state, {
      primaryMarkerPosition: action.payload.primaryMarkerPosition,
      cameraPosition: action.payload.cameraPosition,
      earthRotation: action.payload.earthRotation
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
      twoDimensionalVelocity: action.payload
    })
  },
  [UPDATE_VELOCITY]: (state, action) => {
    return Object.assign({}, state, {
      twoDimensionalVelocity: [
        state.twoDimensionalVelocity[1], action.payload
      ]
    })
  },
  [UPDATE_CONTROL_STATE]: (state, action) => {
    return Object.assign({}, state, {
      controlState: action.payload
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

let tempLocations = [
  { dest: 'Adelaide', lat: -34.9288, lon: 138.6007 },
  { dest: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { dest: 'Ulaanbaatar', lat: 47.8864, lon: 106.9057 },
  { dest: 'Berlin', lat: 52.5200, lon: 13.4050 },
  { dest: 'Amsterdam', lat: 52.3702, lon: 4.8952 },
  { dest: 'New York', lat: 40.7128, lon: -74.0059 },
  { dest: 'AdelaideHome', lat: -34.9288, lon: 138.6007 }
]

let temp = getTravelPath(tempLocations)

const initialState = {
  width: 0,
  height: 0,
  primaryMarkerPosition: 0,
  locations: tempLocations,
  travelPath: temp,
  earthRotation: new THREE.Euler(),
  cameraDistance: 2,
  cameraPosition: new THREE.Vector3(0, 0, 2),
  lightPosition: new THREE.Vector3(0.5, 0.5, 1),
  controlState: 'auto',
  twoDimensionalVelocity: []
}
export default function earthPageReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
