import React, { Component } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

class GoogleSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    return (
      <GooglePlacesAutocomplete
        placeholder="Search"
        minLength={2}
        autoFocus
        returnKeyType={"search"}
        listViewDisplayed={false}
        fetchDetails
        renderDescription={row => row.description}
        onPress={(data, details = null) => {
          this.props.targetLocation(details.geometry);
        }}
        getDefaultValue={() => ""}
        query={{
          key: "AIzaSyBKw7wamdNu5fPpP4iGHkijH6WyXuk-77I",
          language: "en",
          components: "country:swe",
          location: "59.326242, 17.8419718",
          radius: "20000"
        }}
        debounce={200}
      />
    );
  }
}

export default GoogleSearch;
