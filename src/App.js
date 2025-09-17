import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Principal from "./screens/Principal";
import Home from "./screens/Home";
import Perfil from "./screens/Perfil";
import Itens from "./screens/Itens"
import { StatusBar } from "react-native";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
       <StatusBar barStyle="light-content" backgroundColor="black" />
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Principal" component={Principal} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="Itens" component={Itens}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
