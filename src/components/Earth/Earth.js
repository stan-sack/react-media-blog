import React, { PropTypes } from 'react'
import './Earth.scss'
import * as THREE from 'three'
import React3 from 'react-three-renderer'
import { EARTH_RADIUS } from '../../constants/ThreeGeomerty'
import { plotPoints, drawCurves, createSphereArcs, generateComet } from '../../helpers/geometryHelpers'

export const Earth = (props) => (
  <React3
    mainCamera='camera' // this points to the perspectiveCamera which has the name set to "camera" below
    width={props.width}
    height={props.height}
    forceManualRender
    onManualRenderTriggerCreated={props.setManualRenderTrigger}>
    <scene>
      <perspectiveCamera
        key={'rnd' + Math.random()}
        lookAt={new THREE.Vector3(0, 0, 0)}
        name='camera'
        fov={75}
        aspect={props.width / props.height}
        near={0.1}
        far={50}
        position={props.cameraPosition} />
      <ambientLight intensity={0.2} />
      <pointLight
        color={0xffffff}
        intensity={1}
        position={props.lightPosition} />
      <group rotation={props.earthRotation}>
        <mesh>
          <sphereGeometry
            radius={EARTH_RADIUS * 3}
            widthSegments={32}
            heightSegments={32} />
          <meshBasicMaterial
            side={THREE.BackSide}>
            <texture url={'galaxy_starfield.png'} slot={'map'} />
          </meshBasicMaterial>
        </mesh>
        <mesh>
          <sphereGeometry
            radius={EARTH_RADIUS}
            widthSegments={32}
            heightSegments={32} />
          <meshPhongMaterial
            bumpScale={0.1}
            specular={'grey'}>
            <texture url={'earthmap1k.jpg'} />
            <texture url={'earthbump1k.jpg'} slot={'bumpMap'} />
            <texture url={'earthspec1k.jpg'} slot={'specularMap'} />
          </meshPhongMaterial>
        </mesh>
        {generateComet(props)}
        {plotPoints(props.locations)}
        {createSphereArcs(props.locations).map(drawCurves)}
      </group>
    </scene>
  </React3>
)

Earth.propTypes = {
  width : PropTypes.number,
  height : PropTypes.number,
  primaryMarkerPosition : PropTypes.number,
  travelPath : PropTypes.array,
  comet : PropTypes.array,
  cameraPosition: PropTypes.object,
  lightPosition: PropTypes.object,
  locations: PropTypes.array,
  setManualRenderTrigger: PropTypes.func,
  updateCameraPosition: PropTypes.func,
  updateLightPosition: PropTypes.func,
  earthRotation: PropTypes.object
}

export default Earth
