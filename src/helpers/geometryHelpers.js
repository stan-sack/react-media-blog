import * as THREE from 'three'
import React from 'react'
import { EARTH_RADIUS, ARC_HEIGHT_FACTOR } from '../constants/ThreeGeomerty'

export const createSphereArcs = (destinations) => {
  let i = 0
  let travelPath = []
  while (i < destinations.length - 1) {
    let fromVector = destinations[i]
    if (!('x' in fromVector)) {
      fromVector = convertLatLonToVec3(
        destinations[i]['lat'],
        destinations[i]['lon']
      ).multiplyScalar(EARTH_RADIUS)
    }

    let toVector = destinations[i + 1]
    if (!('x' in toVector)) {
      toVector = convertLatLonToVec3(
        destinations[i + 1]['lat'],
        destinations[i + 1]['lon']
      ).multiplyScalar(EARTH_RADIUS)
    }

    let angle = fromVector.angleTo(toVector)
    let dist = fromVector.distanceTo(toVector)
    let controlFromVector = fromVector.clone()
    let controlToVector = toVector.clone()
    // this is setting the centre of the arc. set the constant lower for
    // arcs closer to the sphere
    let xCentre = (ARC_HEIGHT_FACTOR * (fromVector.x + toVector.x))
    let yCentre = (ARC_HEIGHT_FACTOR * (fromVector.y + toVector.y))
    let zCentre = (ARC_HEIGHT_FACTOR * (fromVector.z + toVector.z))

    var arcCentre = new THREE.Vector3(xCentre, yCentre, zCentre)

    var smoothDist = map(dist, 0, 10, 0, (1.45 * angle + 10.45) / dist)

    arcCentre.setLength(EARTH_RADIUS * smoothDist)
    controlToVector.add(arcCentre)
    controlFromVector.add(arcCentre)

    controlToVector.setLength(EARTH_RADIUS * smoothDist)
    controlFromVector.setLength(EARTH_RADIUS * smoothDist)

    let curve = new THREE.CubicBezierCurve3(fromVector, controlFromVector, controlToVector, toVector)

    travelPath.push(curve)
    i++
  }

  return travelPath
}

export const drawCurves = (curve, index) => {
  return (
    <line key={index}>
      <geometry vertices={curve.getPoints(100)} />
      <lineBasicMaterial color={new THREE.Color('skyblue')} />
    </line>
  )
}

export const convertLatLonToVec3 = (lat, lon) => {
  lat = lat * Math.PI / 180.0
  lon = -lon * Math.PI / 180.0

  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    Math.cos(lat) * Math.sin(lon)
  )
}
const map = (x, inMin, inMax, outMin, outMax) => {
  return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

export const getTravelPath = (destinations) => {
  let curves = createSphereArcs(destinations)
  let interpCurves = curves.map((curve, index) => {
    return curve.getPoints(100)
  })
  let flatInterpCurves = [].concat.apply([], interpCurves)
  return flatInterpCurves
}

const addMarker = (locationObject, index) => {
  let colory = new THREE.Color('skyblue')
  let markerPosition = convertLatLonToVec3(locationObject['lat'], locationObject['lon']).multiplyScalar(EARTH_RADIUS)
  let marker = (
    <mesh
      key={index}
      position={markerPosition}>
      <sphereGeometry
        radius={0.01}
        widthSegments={16}
        heightSegments={16} />
      <meshBasicMaterial
        color={colory} />
    </mesh>
  )
  return marker
}

export const plotPoints = (locations) => {
  var markers = locations.map(addMarker)
  return markers
}

export const generateComet = (props) => {
  let markerSubset = []
  if (props.primaryMarkerPosition < 20) {
    markerSubset = props.travelPath.slice(0, props.primaryMarkerPosition)
  } else {
    markerSubset = props.travelPath.slice(props.primaryMarkerPosition - 20, props.primaryMarkerPosition)
  }
  if (typeof props.travelPath[props.primaryMarkerPosition] !== 'undefined') {
    let markerSpheres = markerSubset.map((marker, index) => {
      return (
        <mesh
          key={index}
          position={marker}>
          <sphereGeometry
            radius={index / 1000}
            widthSegments={16}
            heightSegments={16} />
          <meshBasicMaterial
            color={new THREE.Color('red')} />
        </mesh>
      )
    })
    return markerSpheres
  }
}

export const toEuler = (x, y, z, angle) => {
  let s = Math.sin(angle)
  let c = Math.cos(angle)
  let t = 1 - c
  //  if axis is not already normalised then uncomment this
  // double magnitude = Math.sqrt(x*x + y*y + z*z);
  // if (magnitude==0) throw error;
  // x /= magnitude;
  // y /= magnitude;
  // z /= magnitude;
  let heading
  let attitude
  let bank
  if ((x * y * t + z * s) > 0.998) { // north pole singularity detected
    heading = 2 * Math.atan2(x * Math.sin(angle / 2), Math.cos(angle / 2))
    attitude = Math.PI / 2
    bank = 0
  } else if ((x * y * t + z * s) < -0.998) { // south pole singularity detected
    heading = -2 * Math.atan2(x * Math.sin(angle / 2), Math.cos(angle / 2))
    attitude = -Math.PI / 2
    bank = 0
  } else {
    heading = Math.atan2(y * s - x * z * t, 1 - (y * y + z * z) * t)
    attitude = Math.asin(x * y * t + z * s)
    bank = Math.atan2(x * s - y * z * t, 1 - (x * x + z * z) * t)
  }
  return {
    heading: heading,
    attitude: attitude,
    bank: bank
  }
}

export const getPathToNearestFocus = (cameraPosition, locations, currentRotation) => {
  console.log(cameraPosition)
  let nearestLocation = locations[0]
  let currentAdjustedPosition = cameraPosition.clone().applyQuaternion(currentRotation.clone().inverse())
  let minAngle = Math.abs(locations[0].angle.clone().angleTo(currentAdjustedPosition))
  // let indexOfNearest = 0
  locations.slice(1).map((location, index) => {
    let angle = Math.abs(location.angle.clone().angleTo(currentAdjustedPosition))
    if (angle < minAngle) {
      nearestLocation = location
      minAngle = angle
      // indexOfNearest = index
    }
  })
  return getTravelPath([currentAdjustedPosition, nearestLocation])
}

// start here
export const getPathToNextFocus = (cameraPosition, locations, currentRotation) => {
  let currentAdjustedPosition = cameraPosition.clone().applyQuaternion(currentRotation.clone().inverse())
  let minDist = Math.abs(locations[0].angle.clone().distanceTo(currentAdjustedPosition))
  let indexOfNearest = 0
  locations.slice(1).map((location, index) => {
    let dist = Math.abs(location.angle.clone().distanceTo(currentAdjustedPosition))
    if (dist < minDist) {
      minDist = dist
      indexOfNearest = index
    }
  })
  return getTravelPath([currentAdjustedPosition, locations[locations.length % (indexOfNearest + 1)]])
}

export const getPathToPreviousFocus = (cameraPosition, locations, currentRotation) => {
  let currentAdjustedPosition = cameraPosition.clone().applyQuaternion(currentRotation.clone().inverse())
  let minDist = Math.abs(locations[0].angle.clone().distanceTo(currentAdjustedPosition))
  let indexOfNearest = 0
  locations.slice(1).map((location, index) => {
    let dist = Math.abs(location.angle.clone().distanceTo(currentAdjustedPosition))
    if (dist < minDist) {
      minDist = dist
      indexOfNearest = index
    }
  })
  if (indexOfNearest === 0) {
    indexOfNearest = locations.length
  }
  return getTravelPath([currentAdjustedPosition, locations[locations.length % (indexOfNearest - 1)]])
}

export const compressDuplicateLocations = (locations) => {
  if (locations.length > 1) {
    if (locations[0].lat === locations[1].lat && locations[0].lon === locations[1].lon) {
      locations[1].content = locations[0].content.concat(locations[1].content)
      locations.shift()
    }
    locations = [locations[0]].concat(compressDuplicateLocations(locations.slice(1)))
  }
  return locations
}
