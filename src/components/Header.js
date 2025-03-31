import FontAwesome from "@expo/vector-icons/FontAwesome";
import {TouchableOpacity, StyleSheet, View} from "react-native";
import { useNavigation } from '@react-navigation/native';


function Header() {
  const navigation = useNavigation();
    return(
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.buttonToHome}
          onPress={() => navigation.navigate("Home")}
        >
          <FontAwesome name="home" size={45} color="white" />
        </TouchableOpacity>
      </View>
    );
}


const styles = StyleSheet.create ({
    header: {
        backgroundColor: "rgba(177, 16, 16, 1)",
        height: 90,
        width: 500,
        borderBottomColor: "white",
        borderBottomWidth: 3,
        flexDirection: "row",
      },
      buttonToHome: {
        justifyContent: "center",
        alignItems: "center",
        resizeMode: "contain",
        width: 900,
        height: 60,
        marginTop: 20,
      },
})

export default Header;