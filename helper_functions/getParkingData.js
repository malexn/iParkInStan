const latDeltaToMeters = (latitudeDelta) => {
  const ydelta = (latitudeDelta * 40075160) / 360;
  return ydelta;
};

const getParkingData = (latitude, longitude, latitudeDelta, maxRenderRadius, APIkey) => {
    const radius = latDeltaToMeters(latitudeDelta, latitude);
    if (radius > maxRenderRadius) return Promise.resolve([]);
    console.log(radius);
    const url = `https://openparking.stockholm.se/LTF-Tolken/v1/ptillaten/within?radius=${radius}&lat=${latitude}&lng=${longitude}&outputFormat=json&apiKey=${APIkey}`;
    return fetch(url)
      .then(response => response.json())
      .then(responseJson => responseJson.features.map(feature => ({
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: feature.geometry.coordinates.map(coordinate => ({ 
                longitude: coordinate[0], 
                latitude: coordinate[1] 
              }))
            }
      })))
      .catch((error) => {
        console.error(error);
    });
  };

export default getParkingData;
