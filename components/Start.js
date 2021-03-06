import React from "react";

// Importing a lot of React Native functionalities!
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

// Importing the default background image from the assets folder
import BackgroundImage from "../assets/background-image.png";

export default class Start extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      bgColor: this.colors.light,
    };
  }

  // function to update the state with the new background color for Chat Screen chosen by the user
  changeBgColor = (newColor) => {
    this.setState({ bgColor: newColor });
  };

  colors = {
    light: "#e6e6ff",
    dark: "#001a4d",
  };

  render() {
    return (
      // Components to create the color arrays, titles and the app's colors
      <View style={styles.container}>
        <ImageBackground
          source={BackgroundImage}
          resizeMode="cover"
          style={styles.backgroundImage}
        >
          <View style={styles.titleBox}>
            <Text style={styles.title}>Chat App</Text>
          </View>

          <View style={styles.box1}>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                onChangeText={(text) => this.setState({ name: text })}
                value={this.state.name}
                placeholder="Type your name here"
              />
            </View>

            <View style={styles.colorBox}>
              <Text style={styles.chooseColor}>
                Pick your background theme!
              </Text>
            </View>

            {/* All the colors to change the background are here! */}
            <View style={styles.colorArray}>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="light blackground"
                accessibilityHint="Allows you to add a light background to the chat"
                accessibilityRole="button"
                style={styles.color1}
                onPress={() => this.changeBgColor(this.colors.light)}
                text="light"
              ></TouchableOpacity>

              <TouchableOpacity
                accessible={true}
                accessibilityLabel="dark blackground"
                accessibilityHint="Allows you to add a dark background to the chat"
                accessibilityRole="button"
                style={styles.color2}
                onPress={() => this.changeBgColor(this.colors.dark)}
              ></TouchableOpacity>
            </View>

            <View>
              <Text>
                Light                    Dark
              </Text>
            </View>


            {/*This will allow the user to click on a button and be redirected to the chat page */}
            <Pressable
              accessible={true}
              accessibilityLabel="Go to the chat page"
              accessibilityHint="Allows you to go to the chat page"
              accessibilityRole="button"
              style={styles.button}
              onPress={() =>
                this.props.navigation.navigate("Chat", {
                  name: this.state.name,
                  bgColor: this.state.bgColor,
                })
              }
            >
              <Text style={styles.buttonText}>Start Chatting</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

// Creating the app's stylesheet, fixing sizes, centering items, changing colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backgroundImage: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  titleBox: {
    height: "50%",
    width: "88%",
    alignItems: "center",
    paddingTop: 100,
  },

  title: {
    fontSize: 45,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  box1: {
    backgroundColor: "white",
    height: "46%",
    width: "88%",
    justifyContent: "space-around",
    alignItems: "center",
  },

  inputBox: {
    borderWidth: 2,
    borderRadius: 1,
    borderColor: "grey",
    width: "88%",
    height: 60,
    paddingLeft: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  image: {
    width: 20,
    height: 20,
    marginRight: 10,
  },

  input: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 0.5,
  },

  colorBox: {
    marginRight: "auto",
    paddingLeft: 15,
    width: "88%",
  },

  chooseColor: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 1,
    alignSelf: "center"
  },

  colorArray: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    paddingLeft: "20%",
    paddingRight: "20%",
  },

  color1: {
    backgroundColor: "#e6e6ff",
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  color2: {
    backgroundColor: "#001a4d",
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  button: {
    width: "88%",
    height: 70,
    borderRadius: 8,
    backgroundColor: "#1D6085",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});