import * as THREE from 'three'
import { getTravelPath } from '../../../helpers/geometryHelpers'
import { CAMERA_DISTANCE } from '../../../constants/ThreeGeomerty'
// ------------------------------------
// Constants
// ------------------------------------
export const UPDATE_ANIMATION = 'UPDATE_ANIMATION'
export const UPDATE_WINDOW_SIZE = 'UPDATE_WINDOW_SIZE'
export const SET_MANUAL_RENDER_TRIGGER = 'SET_MANUAL_RENDER_TRIGGER'
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
  // we will get this callback every frame
  let oldCam = props.cameraPosition.clone()
  let currentPos = props.travelPath[props.primaryMarkerPosition].clone()
  let newCameraPosition = currentPos.normalize().multiplyScalar(CAMERA_DISTANCE)
  let newCam = newCameraPosition.clone()
  let quaternion = new THREE.Quaternion().setFromUnitVectors(oldCam.normalize(), newCam.normalize())
  let matrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion)
  let newLightPosition = props.lightPosition.clone()
  newLightPosition.applyMatrix4(matrix)

  let nextPrimaryMarkerPosition = props.primaryMarkerPosition + 1
  if (props.primaryMarkerPosition >= props.travelPath.length - 1) {
    nextPrimaryMarkerPosition = 0
  } else if (typeof props.primaryMarkerPosition === 'undefined') {
    nextPrimaryMarkerPosition = 0
  }
  return {
    type    : UPDATE_ANIMATION,
    payload : {
      primaryMarkerPosition: nextPrimaryMarkerPosition,
      lightPosition: newLightPosition,
      cameraPosition: newCameraPosition
    }
  }
}

export const updateWindowSize = (width, height) => {
  return {
    type    : UPDATE_WINDOW_SIZE,
    payload : {
      width: width,
      height: height
    }
  }
}

export const setManualRenderTrigger = (renderTrigger) => {
  return {
    type    : SET_MANUAL_RENDER_TRIGGER,
    payload : renderTrigger
  }
}

export const actions = {
  calculateNextFrame,
  updateWindowSize,
  setManualRenderTrigger
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [UPDATE_ANIMATION]: (state, action) => {
    return Object.assign({}, state, {
      primaryMarkerPosition: action.payload.primaryMarkerPosition,
      cameraPosition: action.payload.cameraPosition,
      lightPosition: action.payload.lightPosition
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
  comet: [],
  cameraPosition: new THREE.Vector3(0, 0, 2),
  lightPosition: new THREE.Vector3(1, 1, 1)
}
export default function earthPageReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
