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
          <FontAwesome name="home" size={35} color="white" />
        </TouchableOpacity>
      </View>
    );
}


const styles = StyleSheet.create ({
    header: {
        backgroundColor: "rgba(177, 16, 16, 1)",
        height: "8%",
        width: "100%",
        justifyContent: "flex-end",
        alignItems: "center",
        borderBottomColor: "white",
        borderBottomWidth: 3,
        flexDirection: "row",
      },
      buttonToHome: {
        alignItems: "center",
        resizeMode: "contain",
        width: "20%",
        height: "50%",
      },
})

export default Header;
