import React, { Component } from "react";
import { View, TextInput, Image, Text, Alert, ScrollView } from "react-native";
import "react-native-get-random-values";
import { v4 as uuid } from "uuid";
import PropTypes from "prop-types";
import "react-native-get-random-values";
import DropDownPicker from "react-native-dropdown-picker";
import retry from 'async-retry';

import { Button } from "../../components";
import { BlueContainer } from "../../config/svgs";
import { getPhoneNumberWithCountryCode, getCountrylabels } from "../../utils";
import { constants } from "../../api";
import styles from "./styles";
import images from "../../config/images";

class LoginView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: "",
      isLoading: false,
      countryCodeLabels: getCountrylabels(),
      selectedCountryCode: getCountrylabels()[0]
    };
  }

  _getUserInfo = async correlationId => {
    let userInfo;
    let shouldRetry = false;
    let startTime = new Date();
    const userInfoFinal = await retry(async (bail) => {
      shouldRetry = false;
      try{
        userInfo = await this.props.getUserInfo(correlationId);
      }
      catch(err){
        shouldRetry = true;
      }
      if((shouldRetry || (userInfo && userInfo.status === "")) && new Date().getTime() - startTime.getTime() < constants.MAX_TIMEOUT)
        throw new Error('Retry initiated');
      else
        return userInfo || null;
    }, {
      retries: constants.MAX_RETRIES,
      minTimeout: constants.RETRY_DELAY,
      factor: 1
    });
    return userInfoFinal;
  };

  _handleLoginClick = async () => {
    this.setState({ isLoading: true });
    const correlationId = uuid();
    const msisdn = getPhoneNumberWithCountryCode(
      this.state.selectedCountryCode.value,
      this.state.phoneNumber
    );
    try {
      const authInitiateResponse = await this.props.authInitiate(
        msisdn,
        correlationId,
        this.state.selectedCountryCode.label
      );
      const authFinalizeResponse = await this.props.authFinalize(correlationId);

      const userInfo = await this._getUserInfo(correlationId);
      if (
        userInfo &&
        userInfo.mobileNumber &&
        userInfo.mobileNumber === msisdn
      ) {
        this.props.showLoginSuccessfulScreen();
        this.setState({ isLoading: false });
        return;
      }
      this.setState({ isLoading: false });
      this.props.showOtpScreen({
        phoneNumber: this.state.phoneNumber,
        country: this.state.selectedCountryCode.label
      });
    } catch (error) {
      this.setState({ isLoading: false });
      if(error && error.message && error.message === 'Other network available'){
        this.props.showOtpScreen({
          phoneNumber: this.state.phoneNumber,
          country: this.state.selectedCountryCode.label
        });
      }
      else
        Alert.alert("Error", (error && error.message) || "Something went wrong!");
    }
  };

  onChangeText = updatedPhoneNumber => {
    this.setState({
      phoneNumber: updatedPhoneNumber.replace(/[^0-9]/g, "")
    });
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <BlueContainer style={styles.curveContainer} />
        <View style={styles.absoluteContainer}>
          <View style={styles.topContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={images.icons.logo_blue}
                resizeMode={"contain"}
                style={styles.logo}
              />
            </View>
            <View>
              <View style={styles.textContainer}>
                <Text style={styles.text}>
                  Enter your mobile no to continue
                </Text>
              </View>
              <View style={styles.inputContainer}>
                <DropDownPicker
                  items={this.state.countryCodeLabels}
                  containerStyle={styles.dropDownContainer}
                  labelStyle={styles.dropDownLabel}
                  defaultValue={this.state.selectedCountryCode.value}
                  itemStyle={styles.dropDownItem}
                  style={styles.dropDownItem}
                  selectedLabelStyle={styles.dropDownItem}
                  showArrow={false}
                  onChangeItem={item =>
                    this.setState({ selectedCountryCode: item })
                  }
                />
                <View style={styles.phoneNumberContainer}>
                  <View style={styles.phoneNumberPrefixContainer}>
                    <TextInput
                      editable={false}
                      value={`+${this.state.selectedCountryCode.value}`}
                      style={styles.phoneNumber}
                    />
                  </View>
                  <View style={styles.phoneNumberInputContainer}>
                    <TextInput
                      dataDetectorTypes={"phoneNumber"}
                      keyboardType={"numeric"}
                      style={styles.phoneNumber}
                      onChangeText={this.onChangeText}
                      value={this.state.phoneNumber}
                      editable={!this.state.isLoading}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              buttonText={"LOGIN"}
              isLoading={this.state.isLoading}
              customStyle={styles.button}
              onButtonPress={this._handleLoginClick}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
}

LoginView.propTypes = {
  authInitiate: PropTypes.func,
  authFinalize: PropTypes.func,
  getUserInfo: PropTypes.func,
  showLoginSuccessfulScreen: PropTypes.func,
  showOtpScreen: PropTypes.func
};

export default LoginView;
