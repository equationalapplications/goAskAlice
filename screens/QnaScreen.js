
import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, Image, Button, View, StatusBar, ActivityIndicator, TouchableOpacity } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

import * as qna from '../components/qna/qna'
import renderIf from '../components/helpers/renderIf'

import Constants from 'expo-constants'

const logo = require('../assets/images/tfjs.jpg');

const passage = 'The wonderful world of very good programming pervades human existance.';
const question = 'What is it about?';

export default class App extends Component {

  constructor(props) {
    super();
    this.state = {
      isTfReady: false,
    }
  }
  async componentDidMount() {
    await tf.ready();
    this.model = await qna.load().catch(e => TTS('Need to load the q n a' + e));
    this.setState({ isTfReady: true });
  }

  askQusetion = async () => {

    const answers = await this.model.findAnswers(question, passage).catch(e => console.log('My head hurts.' + e));

   if (answers[0].text.length > answers[1].text.length && answers[0].text.length > answers[2].text.length) {
      console.log(answers[0].text);
      this.setState({ status: answers[0].text });
    }
    else if (answers[1].text.length > answers[2].text.length) {
      console.log(answers[1].text);
    }
    else {
      console.log(answers[2].text);
    }
  }

  render() {
    return (
      <View>
        {renderIf(this.state.isTfReady,
          <Button
            title='ask'
            onPress={() => this.askQusetion()}
          />
        )}
      </View>
    )
  }
}
