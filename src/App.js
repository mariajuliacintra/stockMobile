import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Principal from "./screens/Principal";
import NoUsersScreen from "./screens/NoUsersScreen";
import Home from "./screens/Home";
import Perfil from "./screens/Perfil";
import { StatusBar } from "react-native";
import FileScreen from "../src/screens/FileScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
       <StatusBar barStyle="light-content" backgroundColor="black" />
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Principal" component={Principal} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="NoUsers" component={NoUsersScreen} />
        <Stack.Screen
  name="Arquivos"
  component={FileScreen}
  options={{ headerShown: false }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
