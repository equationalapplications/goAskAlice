//import { Ionicons } from '@expo/vector-icons';
//import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity } from 'react-native';
import { RectButton, ScrollView, TouchableNativeFeedback } from 'react-native-gesture-handler';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

import Fuse from 'fuse.js';

import * as qna from '../components/qna/qna'
import renderIf from '../components/helpers/renderIf'
import { passageJson } from '../components/aliceinwonderland';

export default class LinksScreen extends Component {

  constructor(props) {
    super();
    this.state = {
      question: 'What is your question?',
      isTfReady: false,
    }
  }

  async componentDidMount() {
    const optionsFuse = {
      isCaseSensitive: false,
      ignoreLocation: true,
      findAllMatches: true,
      ignoreFieldNorm: true,
      keys: ['passage']
    };
    // Create the Fuse index
    // const passageIndex = Fuse.createIndex(optionsFuse.keys, passageJson);
    // this.fuse = new Fuse(passageJson, optionsFuse, passageIndex);
    this.fuse = new Fuse(passageJson, optionsFuse);

    await tf.ready();
    this.model = await qna.load().catch(e => console.log('Need to load the q n a' + e));
    this.setState({ isTfReady: true });
  }

  onChangeText = (text) => {
    this.setState({ question: text });
  }

  askQusetion = async (text) => {

    const result = this.fuse.search(text);

    const answers = await this.model.findAnswers(text, result[0].item.passage).catch(e => console.log('My head hurts.' + e));
    //const answers = await this.model.findAnswers(text, passageJson.passage[0]).catch(e => console.log('My head hurts.' + e));

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
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View>
          <TextInput
            placeholder="Type here to ask!"
            onChangeText={this.onChangeText}
            value={this.state.question}
          >

          </TextInput>
          {renderIf(this.state.isTfReady,

            <TouchableOpacity
              onPress={() => this.askQusetion(this.state.question)}>
              <Text>Ask</Text>
            </TouchableOpacity>

          )}
          <Text>{this.state.question}</Text>
        </View>
      </ScrollView>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  contentContainer: {
    paddingTop: 15,
  },
  optionIconContainer: {
    marginRight: 12,
  },
  option: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: '#ededed',
  },
  lastOption: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 15,
    alignSelf: 'flex-start',
    marginTop: 1,
  },
});
