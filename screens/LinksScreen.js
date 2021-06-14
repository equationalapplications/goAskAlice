//import { Ionicons } from '@expo/vector-icons';
//import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

import * as qna from '../components/qna/qna'
import renderIf from '../components/helpers/renderIf'

const passage = 'The wonderful world of very good programming pervades human existance.';
const question = 'What is it about?';

export default class LinksScreen extends Component {
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
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View>
          {renderIf(this.state.isTfReady,
            <Button
              title='ask'
              onPress={() => this.askQusetion()}
            />
          )}
        </View>
        {/*<OptionButton
        icon="md-school"
        label="Read the Expo documentation"
        onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
      />

      <OptionButton
        icon="md-compass"
        label="Read the React Navigation documentation"
        onPress={() => WebBrowser.openBrowserAsync('https://reactnavigation.org')}
      />

      <OptionButton
        icon="ios-chatboxes"
        label="Ask a question on the forums"
        onPress={() => WebBrowser.openBrowserAsync('https://forums.expo.io')}
        isLastOption
      />*/}
      </ScrollView>
    );
  }
}
/*function OptionButton({ icon, label, onPress, isLastOption }) {
  return (
    <RectButton style={[styles.option, isLastOption && styles.lastOption]} onPress={onPress}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.optionIconContainer}>
          <Ionicons name={icon} size={22} color="rgba(0,0,0,0.35)" />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionText}>{label}</Text>
        </View>
      </View>
    </RectButton>
  );
}*/

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
