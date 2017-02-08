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
    this.earthRadius = 1;
    this.travelPath = [];
    this.cameraDistance = 2;
    this.lightDistance = 16;
    this.comet = [];
    //set this closer to zero to mark the arc sit on the earth
    this.arcHeightFactor = 0.5;

    this.state = {
      primaryMarkerPosition: 0
    };

    this.destinations = [
      {dest: 'Adelaide', lat: -34.9288, lon: 138.6007},
      {dest: 'Sydney', lat: -33.8688, lon: 151.2093},
      {dest: 'Ulaanbaatar', lat: 47.8864, lon: 106.9057},
      {dest: 'Berlin', lat: 52.5200, lon: 13.4050},
      {dest: 'Amsterdam', lat: 52.3702, lon: 4.8952},
      {dest: 'New York', lat: 40.7128, lon: -74.0059},
      {dest: 'AdelaideHome', lat: -34.9288, lon: 138.6007}
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
    this.cameraPosition = new THREE.Vector3(0, 0, 2).multiplyScalar(this.cameraDistance);
    this.lightPosition = new THREE.Vector3(1, 1, 1).multiplyScalar(this.lightDistance);

    this._onAnimate = () => {
      // we will get this callback every frame

      // this.lightPosition = new THREE.Vector3(1, 1, 1).multiplyScalar(this.lightDistance);

      // pretend cubeRotation is immutable.
      // this helps with updates and pure rendering.
      // React will be sure that the rotation has now updated.
      let positionToSet = this.state.primaryMarkerPosition + 1
      if (this.state.primaryMarkerPosition >= this.travelPath.length || typeof this.state.primaryMarkerPosition == 'undefined'){
        positionToSet = 0;
      }
      this.setState({
        // cubeRotation: new THREE.Euler(0, this.state.cubeRotation.y + 0.01, 0),
        primaryMarkerPosition: positionToSet
      });

    };
    this.addMarker = (locationObject) => {
      var colory = new THREE.Color( 'skyblue' );
      var markerPosition = this.convertLatLonToVec3(locationObject['lat'], locationObject['lon']).multiplyScalar(this.earthRadius)
      var marker = (
        <mesh
          key={locationObject['dest']}
          position={markerPosition}>
          <sphereGeometry
            radius={.01}
            widthSegments={16}
            heightSegments={16}/>
          <meshBasicMaterial
            color={colory}/>
        </mesh>
      )
      return marker
    }

    this.plotPoints = () => {
      var markers = this.destinations.map(this.addMarker);
      return markers;
    }
    this.generateComet = () => {

      let markerSubset = []
      if (this.state.primaryMarkerPosition < 20) {
        markerSubset = this.travelPath.slice(0,this.state.primaryMarkerPosition)
      } else {
        markerSubset = this.travelPath.slice(this.state.primaryMarkerPosition-20,this.state.primaryMarkerPosition)
      }
      if (typeof this.travelPath[this.state.primaryMarkerPosition] !== 'undefined'){
        let markerSpheres = markerSubset.map((marker, index) => {
          return(
            <mesh
              key={index}
              position={marker}>
              <sphereGeometry
                radius={index/1000}
                widthSegments={16}
                heightSegments={16}/>
              <meshBasicMaterial
                color={new THREE.Color("red")}/>
            </mesh>
          )
        })

        let oldCam = this.cameraPosition.clone()
        let currentPos = this.travelPath[this.state.primaryMarkerPosition].clone()
        this.cameraPosition = currentPos.normalize().multiplyScalar(this.cameraDistance)
        let newCam = this.cameraPosition.clone()
        let quaternion = new THREE.Quaternion().setFromUnitVectors(oldCam.normalize(), newCam.normalize());
        let matrix = new THREE.Matrix4().makeRotationFromQuaternion( quaternion );
        this.lightPosition.applyMatrix4( matrix );


        return markerSpheres
      }
    }

    this.createSphereArcs = () => {
      let i = 0;
      let travelPath = [];
      while (i < this.destinations.length-1) {
        let fromVector = this.convertLatLonToVec3(this.destinations[i]['lat'], this.destinations[i]['lon']).multiplyScalar(this.earthRadius)
        let toVector = this.convertLatLonToVec3(this.destinations[i+1]['lat'], this.destinations[i+1]['lon']).multiplyScalar(this.earthRadius)
        let angle = fromVector.angleTo(toVector);
        let dist = fromVector.distanceTo(toVector);
        let controlFromVector = fromVector.clone();
        let controlToVector = toVector.clone();
        // this is setting the centre of the arc. set the constant lower for
        // arcs closer to the sphere
        let xCentre = ( this.arcHeightFactor * (fromVector.x + toVector.x) );
        let yCentre = ( this.arcHeightFactor * (fromVector.y + toVector.y) );
        let zCentre = ( this.arcHeightFactor * (fromVector.z + toVector.z) );

        var arcCentre = new THREE.Vector3(xCentre, yCentre, zCentre);

        var smoothDist = this.map(dist, 0, 10, 0, (1.45*angle+10.45)/dist );

        arcCentre.setLength( this.earthRadius * smoothDist );
        controlToVector.add(arcCentre);
        controlFromVector.add(arcCentre);

        controlToVector.setLength( this.earthRadius * smoothDist );
        controlFromVector.setLength( this.earthRadius * smoothDist );

        let curve = new THREE.CubicBezierCurve3( fromVector, controlFromVector, controlToVector, toVector );

        travelPath.push(curve);
        i++;
      }

      return travelPath;
    }

    this.drawCurves = (curve, index) => {
      let curves = this.createSphereArcs();

      return curves.map((curve, index) => {
        return (
          <line key={index}>
            <geometry vertices={curve.getPoints(100)}/>
            <lineBasicMaterial color={new THREE.Color( 'skyblue' )}/>
          </line>

        );
      })

    }

    this.convertLatLonToVec3 = (lat,lon) => {

      lat =  lat * Math.PI / 180.0;
      lon = -lon * Math.PI / 180.0;

      return new THREE.Vector3(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lon)
      );
    }
    this.map = ( x,  in_min,  in_max,  out_min,  out_max) => {
      return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    let curves = this.createSphereArcs();
    curves.map((curve, index) => {
      this.travelPath = this.travelPath.concat(curve.getPoints(100))
    })
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
            key={"rnd"+Math.random()}
            lookAt={new THREE.Vector3(0, 0, 0)}
            name="camera"
            fov={75}
            aspect={this.width / this.height}
            near={0.1}
            far={50}
            position={this.cameraPosition}/>
          <pointLight
            key={"rnd"+Math.random()}
            color={0xffffff}
            intensity={1}
            position={this.lightPosition}/>
          <mesh>
            <sphereGeometry
              radius={this.earthRadius*3}
              widthSegments={32}
              heightSegments={32}/>
            <meshBasicMaterial
              side={THREE.BackSide}>
              {this.texture4}
            </meshBasicMaterial>
          </mesh>
          <mesh>
            <sphereGeometry
              radius={this.earthRadius}
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
          {this.generateComet()}
          {this.plotPoints()}
          {this.drawCurves()}

        </scene>
      </React3>
    );
  }
}



export default withStyles(s)(Earth);
