import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  PermissionsAndroid
} from "react-native";
// import { MapView, Constants } from "expo";
import MapView from "react-native-maps";

import { Button } from "react-native-elements";
import DeviceMarker from "./components/DeviceMarker";
import GoogleSearch from "./components/GoogleSearch";

import debounce from "./helper_functions/debounce";
import getParkingData from "./helper_functions/getParkingData";
import checkTime from "./helper_functions/checkTime";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATTITUDE_DELTA = 0.006;
const LONGTITUDE_DELTA = LATTITUDE_DELTA * ASPECT_RATIO;
const DEBOUNCE_WAIT = 250;
const MAX_RENDER_RADIUS = 1000;
const PARKING_API_KEY = "24b5d49f-5010-4f60-bb32-e2c7c8168195";

const getPosOptions = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 1000
};

const watchIDOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 1000
};

const getPosition = function(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dataLoading: false,
      timeToPark: 100, // 1 hour
      mapRef: null,
      clearId: null,
      currentRegion: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
      },
      deviceMarkerPosition: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
      },
      allowedParkingData: []
    };
  }

  componentDidMount() {
    getPosition(getPosOptions)
      .then(position => {
        const initialRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATTITUDE_DELTA,
          longitudeDelta: LONGTITUDE_DELTA
        };
        this.setState({
          currentRegion: initialRegion,
          deviceMarkerPosition: initialRegion
        });

        return [position.coords.latitude, position.coords.longitude];
      })
      .catch(error => console.error(error))
      .then(coordinates =>
        getParkingData(
          coordinates[0],
          coordinates[1],
          LATTITUDE_DELTA,
          MAX_RENDER_RADIUS,
          PARKING_API_KEY
        )
      )
      .then(allowedParkingData => this.setState({ allowedParkingData }))
      .then(() => this.setState({ loading: false }));

    // This crashes android
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const lat = parseFloat(position.coords.latitude);
        const long = parseFloat(position.coords.longitude);
        const lastRegion = {
          latitude: lat,
          longitude: long,
          longitudeDelta: LONGTITUDE_DELTA,
          latitudeDelta: LATTITUDE_DELTA
        };
        this.setState({
          deviceMarkerPosition: lastRegion
        });
      },
      error => console.log(new Date(), error),
      { enableHighAccuracy: true, timeout: 100000, maximumAge: 3000 }
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  centerMapOnMe = () => {
    this.state.mapRef.animateToRegion(this.state.deviceMarkerPosition);
  };

  centerMapOnTarget = target => {
    const { lat, lng } = target.location;
    this.state.mapRef.animateToRegion({
      ...this.state.currentRegion,
      latitude: lat,
      longitude: lng
    });
  };

  renderLoading = () => {
    if (this.state.dataLoading) {
      return (
        <View style={styles.loading}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  handleRef = ref => {
    this.setState({ mapRef: ref });
  };
  onRegionChange = region => {
    this.setState({ currentRegion: region });
  };
  animateToRegion = () => {
    this.state.mapRef.animateToRegion(this.state.currentRegion, 0);
  };

  handleRegionChangeComplete = newRegion => {
    this.setState({ dataLoading: true });
    debounce(
      region =>
        getParkingData(
          region.latitude,
          region.longitude,
          region.latitudeDelta,
          MAX_RENDER_RADIUS,
          PARKING_API_KEY
        ),
      DEBOUNCE_WAIT
    )(newRegion).then(allowedParkingData =>
      this.setState({ allowedParkingData, dataLoading: false })
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.loading ? null : (
          <MapView
            ref={this.handleRef}
            onMapReady={this.animateToRegion}
            followsUserLocation={true}
            style={styles.map}
            onRegionChange={() => {
              clearTimeout(this.state.clearId);
              this.setState({ dataLoading: false });
            }}
            onRegionChangeComplete={region => {
              var clearId = setTimeout(
                () => this.handleRegionChangeComplete(region),
                400
              );
              this.setState({ clearId: clearId });
            }}
          >
            <DeviceMarker coordinate={this.state.deviceMarkerPosition} />
            {this.state.allowedParkingData.map(feature => {
              const [valid, color] = checkTime(
                feature.properties.START_TIME,
                feature.properties.END_TIME,
                this.state.timeToPark
              );
              if (valid) {
                return (
                  <MapView.Polyline
                    key={feature.id}
                    coordinates={feature.geometry.coordinates}
                    strokeColor={color}
                    strokeWidth={5}
                  />
                );
              }
            })}
          </MapView>
        )}
        <View>{this.renderLoading()}</View>
        <View style={styles.searchContainer}>
          <GoogleSearch
            style={styles.googleSearch}
            targetLocation={this.centerMapOnTarget}
          />
          <Button
            onPress={this.centerMapOnMe}
            buttonStyle={styles.centerButton}
            containerViewStyle={{ marginLeft: 0, marginRight: 0 }}
            icon={{ name: "my-location", style: { marginRight: 0 } }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    height: 500,
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontSize: 20,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9999
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#eaeaea",
    opacity: 0.8,
    top: 20
  },
  centerButton: {
    width: 50,
    margin: 0,
    backgroundColor: "#50ba50"
  }
});
