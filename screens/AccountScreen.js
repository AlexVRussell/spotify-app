import React from "react";
import {Text, View, Dimensions, Image, TouchableOpacity} from "react-native";

const { height } = Dimensions.get('window');

export default function AccountScreen( { navigation } ) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/syfty-logo-final.png')} style={styles.title} />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>  
    </View>
  );
}   

const styles = {
    container: {
        flex: 1,
        backgroundColor: "#efe7cdff",
    },
    title: {
      width: 45,
      height: 45,
      marginTop: height * 0.04,
      marginBottom: height * 0.02,
      alignSelf: 'center',
    },

    backButton: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: '#266F4C',
      borderRadius: 6,
      zIndex: 1000,
      elevation: 5,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowColor: '#000',
    },

    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
  }