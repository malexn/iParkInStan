import React from "react";
import { View, StyleSheet } from "react-native";
// import { MapView } from "expo";
import MapView from "react-native-maps";

const DeviceMarker = props => (
  <MapView.Marker coordinate={props.coordinate}>
    <View style={styles.radius}>
      <View style={styles.marker} />
    </View>
  </MapView.Marker>
);

const styles = StyleSheet.create({
  radius: {
    height: 50,
    width: 50,
    borderRadius: 50 / 2,
    overflow: "hidden",
    backgroundColor: "rgba(0,122,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,122,255,0.3)",
    alignItems: "center",
    justifyContent: "center"
  },
  marker: {
    height: 20,
    width: 20,
    borderWidth: 3,
    borderColor: "white",
    borderRadius: 20 / 2,
    overflow: "hidden",
    backgroundColor: "#007AFF"
  }
});

export default DeviceMarker;
