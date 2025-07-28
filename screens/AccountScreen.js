import React from "react";
import {Text, View, Dimensions} from "react-native";

const { height } = Dimensions.get('window');

export default function AccountScreen() {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Account Screen</Text>
    </View>
  );
}   

const styles = {
    container: {
        flex: 1,
        backgroundColor: "#545454",
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        padding: height * 0.05,

    }
}