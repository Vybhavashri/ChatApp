import React, { Component } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import {
  Bubble,
  GiftedChat,
  SystemMessage,
  Day,
  InputToolbar,
} from 'react-native-gifted-chat';

import * as firebase from 'firebase';
import 'firebase/firestore';
// import AsynceStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
// import NetInfo
import NetInfo from '@react-native-community/netinfo';

import CustomActions from "./CustomActions";
import MapView from 'react-native-maps';

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIYewULwtJfRSDWhtuy16qRXKFfJAhL9A",
  authDomain: "chatapp-ee0b7.firebaseapp.com",
  projectId: "chatapp-ee0b7",
  storageBucket: "chatapp-ee0b7.appspot.com",
  messagingSenderId: "1016229915452",
  appId: "1:1016229915452:web:cae091df961942ef474c39"
};

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: null,
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      isConnected: false,
      image: null,
      location: null,
    };

    //initializing firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    // reference to the Firestore messages collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    this.refMsgsUser = null;
  }

  onCollectionUpdate = QuerySnapshot => {
    const messages = [];
    // go through each document
    QuerySnapshot.forEach(doc => {
      // get the queryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages: messages,
    });
    // save messages to local AsyncStorage
    this.saveMessages();
    this.saveUser();
  };

  // get messages from AsyncStorage
  async getMessages() {
    let messages = '';
    try {
      messages = (await AsyncStorage.getItem('messages')) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // get user from AsyncStorage
  async getUser() {
    let user = '';
    try {
      user = await AsyncStorage.getItem('user') || [];
      this.setState({
        user: JSON.parse(user)
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  // save messages on the asyncStorage
  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  // saves user to asyncStorage
  async saveUser() {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(this.state.user));
    } catch (error) {
      console.log(error.message);
    }
  }

  // delete message from asyncStorage
  // not called in app used in development only
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem("messages");
      this.setState({
        messages: [],
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    let { name } = this.props.route.params;
    if (name === '') name = 'UNNAMED'
    this.props.navigation.setOptions({ title: name });

    this.getMessages();
    this.getUser();

    // check the user connection status, online?
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log('online');
        // listens for updates in the collection
        this.unsubscribe = this.referenceChatMessages
          .orderBy('createdAt', 'desc')
          .onSnapshot(this.onCollectionUpdate);

        // listen to authentication events
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async user => {
            if (!user) {
              return await firebase.auth().signInAnonymously();
            }

            // update user state with currently active data
            this.setState({
              uid: user.uid,
              messages: [],
              user: {
                _id: user.uid,
                name: name,
                avatar: 'https://placeimg.com/140/140/any',
              },
            });

            //referencing messages of current user
            this.refMsgsUser = firebase
              .firestore()
              .collection('messages')
              .where('uid', '==', this.state.user.uid);
          });
        // save messages locally to AsyncStorage
        this.saveMessages();
        this.saveUser();
      } else {
        // the user is offline
        this.setState({ isConnected: false });
        console.log('offline');
        this.getMessages();
        this.getUser();
      }
    });
  }

  componentWillUnmount() {
    if (this.state.isConnected) {
      // stop listening to authentication
      this.authUnsubscribe();
      // stop listening for changes
      this.unsubscribe();
    }
  }

  addMessage() {
    const message = this.state.messages[0];
    // add a new message to the collection
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: this.state.user,
      image: message.image || null,
      location: message.location || null,
    });
  }

  onSend(messages = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.saveMessages();
        this.saveUser();
        this.addMessage();
      }
    );
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#dbb35a',
          },
          left: {
            backgroundColor: 'white',
          },
        }}
      />
    );
  }

  renderSystemMessage(props) {
    return <SystemMessage {...props} textStyle={{ color: '#736357' }} />;
  }

  renderDay(props) {
    return (
      <Day
        {...props}
        textStyle={{
          color: '#fff',
          backgroundColor: '#9e938cb0',
          borderRadius: 15,
          padding: 5,
        }}
      />
    );
  }

  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  renderCustomActions = (props) => <CustomActions {...props} />;

  render() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });
    const { bgColor } = this.props.route.params.bgColor;

    return (
      <View style={{
        backgroundColor: bgColor,
        flex: 1,
      }}>
        <GiftedChat
          style={styles.giftedChat}
          renderBubble={this.renderBubble.bind(this)}
          renderSystemMessage={this.renderSystemMessage}
          renderDay={this.renderDay}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: this.state.user._id,
            name: this.state.name,
            avatar: this.state.user.avatar,
          }}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
        />
        {Platform.OS === 'android' ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftedChat: {
    color: '#000',
    flex: 1,
    width: "75%",
    paddingBottom: 10,
    justifyContent: "center",
    borderRadius: 5,
  },
});