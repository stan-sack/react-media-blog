import * as THREE from 'three'
import { getTravelPath } from '../../../helpers/geometryHelpers'
import { EARTH_RADIUS } from '../../../constants/ThreeGeomerty'
// ------------------------------------
// Constants
// ------------------------------------
export const UPDATE_ANIMATION = 'UPDATE_ANIMATION'
export const UPDATE_WINDOW_SIZE = 'UPDATE_WINDOW_SIZE'
export const SET_MANUAL_RENDER_TRIGGER = 'SET_MANUAL_RENDER_TRIGGER'
export const UPDATE_CAMERA_DISTACE = 'UPDATE_CAMERA_DISTACE'
export const UPDATE_CONTROL_STATE = 'UPDATE_CONTROL_STATE'
// export const COUNTER_DOUBLE_ASYNC = 'COUNTER_DOUBLE_ASYNC'

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
  let newEarthDir
  let newCameraPosition = props.cameraPosition.normalize().multiplyScalar(props.cameraDistance)

  // we will get this callback every frame
  if (props.controlState === 'auto') {
    let oldEarthDir = props.earthDirection.clone()
    let oldPos = props.travelPath[props.primaryMarkerPosition].clone()
    console.log(oldPos)
    let angle = oldEarthDir.angleTo(oldPos)
    oldPos.cross(oldEarthDir)
    oldEarthDir.applyAxisAngle(oldPos, -angle)
    newEarthDir = oldEarthDir.normalize().applyAxisAngle(oldPos, -angle).clone()

    // KEEP THIS CODE ITS FOR ROTATING THE CAMERA AND LIGHT!!!
    // let oldCam = props.cameraPosition.clone()
    // let currentPos = props.travelPath[props.primaryMarkerPosition].clone()
    // let newCam = newCameraPosition.clone()
    // let quaternion = new THREE.Quaternion().setFromUnitVectors(oldCam.normalize(), newCam.normalize())
    // let matrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion)
    // newLightPosition = props.lightPosition.clone()
    // newLightPosition.applyMatrix4(matrix)

    nextPrimaryMarkerPosition = props.primaryMarkerPosition + 1
    if (props.primaryMarkerPosition >= props.travelPath.length - 1) {
      nextPrimaryMarkerPosition = 0
    } else if (typeof props.primaryMarkerPosition === 'undefined') {
      nextPrimaryMarkerPosition = 0
    }
  } else {
    // drag code goes Here
    nextPrimaryMarkerPosition = props.primaryMarkerPosition
    newEarthDir = props.earthDirection.clone()
  }

  return {
    type    : UPDATE_ANIMATION,
    payload : {
      primaryMarkerPosition: nextPrimaryMarkerPosition,
      earthDirection: newEarthDir,
      cameraPosition: newCameraPosition
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
      earthDirection: action.payload.earthDirection,
      cameraPosition: action.payload.cameraPosition
      // lightPosition: action.payload.lightPosition
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

const initialState = {
  width: 0,
  height: 0,
  primaryMarkerPosition: 0,
  locations: tempLocations,
  travelPath: getTravelPath(tempLocations),
  earthDirection: new THREE.Vector3(0, 0, -1),
  cameraDistance: 2,
  cameraPosition: new THREE.Vector3(0, 0, 2),
  lightPosition: new THREE.Vector3(0.5, 0.5, 1),
  controlState: 'auto'
}
export default function earthPageReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
