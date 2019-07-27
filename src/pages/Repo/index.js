import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { WebView } from 'react-native-webview';

class Repo extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('repo').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {};

  render() {
    const { navigation } = this.props;
    const repo = navigation.getParam('repo');
    return (
      <WebView
        source={{
          uri: repo.html_url,
        }}
        style={{ flex: 1 }}
      />
    );
  }
}

export default Repo;
