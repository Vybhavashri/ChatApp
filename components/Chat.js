import React, { Component } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import {
  Bubble,
  GiftedChat,
  SystemMessage,
  Day,
} from 'react-native-gifted-chat';

import * as firebase from 'firebase';
import 'firebase/firestore';

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
      uid: 0,
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
      });
    });
    this.setState({
      messages: messages,
    });
  };

  componentDidMount() {
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    // listen to authentication events
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
      if (!user) {
        await firebase.auth().signInAnonymously();
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
      // listens for updates in the collection
      this.unsubscribe = this.referenceChatMessages
        .orderBy('createdAt', 'desc')
        .onSnapshot(this.onCollectionUpdate);
      //referencing messages of current user
      this.refMsgsUser = firebase
        .firestore()
        .collection('messages')
        .where('uid', '==', this.state.uid);
    });
  }

  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribe();
  }

  addMessage() {
    const message = this.state.messages[0];
    // add a new message to the collection
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: this.state.user,
    });
  }

  onSend(messages = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
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
          backgroundColor: '#9e938c',
          borderRadius: 15,
          padding: 10,
        }}
      />
    );
  }

  render() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    let bgColor = this.props.route.params.bgColor;

    return (
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: bgColor,
            width: '100%',
            height: '100%',
          }}
        >
          <GiftedChat
            style={styles.giftedChat}
            renderBubble={this.renderBubble.bind(this)}
            renderSystemMessage={this.renderSystemMessage}
            renderDay={this.renderDay}
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: this.state.user._id,
              name: this.state.name,
              avatar: this.state.user.avatar,
            }}
          />
          {Platform.OS === 'android' ? (
            <KeyboardAvoidingView behavior="height" />
          ) : null}
        </View>
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
  },
});
