import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { TextInput } from 'react-native-paper';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import Fuse from 'fuse.js';
import { AdMobBanner } from 'expo-ads-admob';

import * as qna from '../components/qna/qna'
import renderIf from '../components/helpers/renderIf'
import { passageJson } from '../components/aliceinwonderland';

export default class LinksScreen extends Component {

  constructor(props) {
    super();
    this.state = {
      question: '',
      answer: '',
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

    const answers = await this.model.findAnswers(text, result[0].item.passage).catch(e => this.setState({ answer: e }));

    if (answers[0].text.length > answers[1].text.length && answers[0].text.length > answers[2].text.length) {
      this.setState({ answer: answers[0].text });
    }
    else if (answers[1].text.length > answers[2].text.length) {
      this.setState({ answer: answers[1].text });
    }
    else {
      this.setState({ answer: answers[2].text });
    }
  }

  render() {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View>
          <TextInput
            label="Ask a question"
            value={this.state.question}
            onChangeText={this.onChangeText}
          />
          <Text></Text>
          {renderIf(this.state.isTfReady,

            <TouchableOpacity
              onPress={() => this.askQusetion(this.state.question)}>
              <Text>Ask</Text>
            </TouchableOpacity>

          )}
          <Text></Text>
          <Text>{this.state.answer}</Text>
        </View>
        <View style={styles.adMob}>
          <AdMobBanner
            bannerSize="banner"
            adUnitID="ca-app-pub-5219337249584359/9331403147"
          />
        </View>
      </ScrollView>
    );
  }
}


const styles = StyleSheet.create({
  adMob: {
    marginBottom: 0,
    justifyContent: 'flex-end',
  },
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
