import React from 'react';
import * as THREE from 'three';
import React3 from 'react-three-renderer';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Earth.css';

class Earth extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.height = 300;
    this.width = 300;

    this.destinations = [
      {dest: 'adelaide', lat: -34.9288, lon: 138.6007},
      {dest: 'sydney', lat: -33.8688, lon: 151.2093}
    ]

    this.loadedTextures = 0;
    this.loaded = () => {
      this.loadedTextures += 1;
    }

    this.texture4 = <texture
      url={"galaxy_starfield.png"}
      slot={"map"}
      onLoad={this.loaded()}/>
    this.texture1 = <texture url={"earthmap1k.jpg"} onLoad={this.loaded()}/>
    this.texture2 = <texture url={"earthbump1k.jpg"} slot={"bumpMap"} onLoad={this.loaded()}/>
    this.texture3 = <texture url={"earthspec1k.jpg"} slot={"specularMap"} onLoad={this.loaded()}/>



    // construct the position vector here, because if we use 'new' within render,
    // React will think that things have changed when they have not.
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
    this.lightPosition = new THREE.Vector3(9, 9, 9);

    this.state = {
      cubeRotation: new THREE.Euler(),
    };
    this._onAnimate = () => {
      // we will get this callback every frame

      // pretend cubeRotation is immutable.
      // this helps with updates and pure rendering.
      // React will be sure that the rotation has now updated.
      this.setState({
        cubeRotation: new THREE.Euler(
          0,
          this.state.cubeRotation.y + 0.01,
          0
        ),
      });
    };
    this.addMarker = (locationObject) => {
      var radius = 1;
      var colory = new THREE.Color( 'skyblue' );
      var marker = (
        <mesh
          key={locationObject['dest']}
          position={this.convertLatLonToVec3(locationObject['lat'], locationObject['lon']).multiplyScalar(radius).applyEuler(this.state.cubeRotation)}>
          <sphereGeometry
            radius={.01}
            widthSegments={16}
            heightSegments={16}/>
          <meshBasicMaterial
            color={colory}/>
        </mesh>
      )
      // var marker = new THREE.Mesh( new THREE.SphereGeometry(1, 8, 4), new THREE.MeshBasicMaterial({color:colory}) );
      // marker.position = convertLatLonToVec3(locationObject['lat'], locationObject['lon']).multiplyScalar(radius);
      // scene.add(marker)
      return marker
    }

    this.plotPoints = () => {
      var markers = this.destinations.map(this.addMarker);
      return markers;
    }

    this.convertLatLonToVec3 = (lat,lon) => {

      lat =  lat * Math.PI / 180.0;
      lon = -lon * Math.PI / 180.0;

      return new THREE.Vector3(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lon) );
      }
  }

  componentDidMount(){
    this.height = window.innerHeight;
    this.width = window.innerWidth;
  }



    render() {
      return(
        <React3
          mainCamera="camera" // this points to the perspectiveCamera which has the name set to "camera" below
          width={this.width}
          height={this.height}
          onAnimate={this._onAnimate}>
          <scene>
            <perspectiveCamera
              name="camera"
              fov={75}
              aspect={this.width / this.height}
              near={0.1}
              far={50}
              position={this.cameraPosition}/>
            <pointLight
              color={0xffffff}
              intensity={1}
              position={this.lightPosition}/>
            <mesh>
              <sphereGeometry
                radius={3}
                widthSegments={32}
                heightSegments={32}/>
              <meshBasicMaterial
                side={THREE.BackSide}>
                {this.texture4}
              </meshBasicMaterial>
            </mesh>
            <mesh rotation={this.state.cubeRotation}>
              <sphereGeometry
                radius={1}
                widthSegments={32}
                heightSegments={32}/>
              <meshPhongMaterial
                bumpScale={.1}
                specular={"grey"}>
                {this.texture1}
                {this.texture2}
                {this.texture3}
              </meshPhongMaterial>
            </mesh>
            {this.plotPoints()}
          </scene>
        </React3>
      );
    }
  }

  export default withStyles(s)(Earth);
