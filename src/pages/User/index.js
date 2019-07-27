import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  LoadingContainer,
  LoadingPage,
  NoItemsText,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    page: 1,
    endOfPage: false,
    loading: true,
    loadingPage: false,
    refreshing: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({ stars: response.data, loading: false });
  }

  loadMore = async () => {
    const { page, stars } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    try {
      this.setState({ loadingPage: true });

      const response = await api.get(
        `/users/${user.login}/starred?page=${page + 1}`
      );

      if (response.data.length === 0) {
        this.setState({ endOfPage: true, loadingPage: false });
      } else {
        this.setState({
          stars: [...stars, ...response.data],
          page: page + 1,
          loadingPage: false,
        });
      }
    } catch (error) {
      console.tron.log(error);
    }
  };

  handleNavigate = repo => {
    const { navigation } = this.props;

    navigation.navigate('Repo', { repo });
  };

  refreshList = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    try {
      this.setState({ refreshing: true });

      const response = await api.get(`/users/${user.login}/starred`);

      this.setState({
        refreshing: false,
        stars: response.data,
        page: 1,
      });
    } catch (error) {
      console.tron.log(error);
    }
  };

  render() {
    const { navigation } = this.props;
    const { stars, endOfPage, loading, loadingPage, refreshing } = this.state;

    const user = navigation.getParam('user');
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading && (
          <LoadingContainer>
            <ActivityIndicator size={70} color="#7159c1" />
          </LoadingContainer>
        )}

        {stars.length > 0 && (
          <>
            <Stars
              data={stars}
              keyExtractor={star => String(star.id)}
              onEndReachedThreshold={0.2} // Carrega mais itens quando chegar em 20% do fim
              onEndReached={!endOfPage && this.loadMore} // Função que carrega mais itens
              onRefresh={this.refreshList} // Função dispara quando o usuário arrasta a lista pra baixo
              refreshing={refreshing}
              renderItem={({ item }) => (
                <Starred onPress={() => this.handleNavigate(item)}>
                  <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                  <Info>
                    <Title>{item.name}</Title>
                    <Author>{item.owner.login}</Author>
                  </Info>
                </Starred>
              )}
            />
            {loadingPage && (
              <LoadingPage>
                <ActivityIndicator size={30} color="#7159c1" />
              </LoadingPage>
            )}
          </>
        )}

        {!loading && stars.length === 0 && (
          <NoItemsText>
            Não há repositórios favoritados por este usuário
          </NoItemsText>
        )}
      </Container>
    );
  }
}
