import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "react-native";
import Cadastro from "./screens/Cadastro";
import Home from "./screens/Home";
import Login from "./screens/Login";
import MinhasReservas from "./screens/MinhasReservas";
import Perfil from "./screens/Perfil";
import Principal from "./screens/Principal";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="white" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Principal" component={Principal} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="MinhasReservas" component={MinhasReservas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
