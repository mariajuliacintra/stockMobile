import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Principal from "./screens/Principal";
import NoUsersScreen from "./screens/NoUsersScreen";
import Home from "./screens/Home";
import Perfil from "./screens/Perfil";
import FileScreen from "./screens/FileScreen";
import AuthLoading from "./screens/AuthLoading"; // 👈 nova tela
import { StatusBar } from "react-native";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <Stack.Navigator
        initialRouteName="AuthLoading"
        screenOptions={{ headerShown: false }}
      >
        {/* Verificação inicial */}
        <Stack.Screen name="AuthLoading" component={AuthLoading} />

        {/* Rotas principais */}
        <Stack.Screen name="Principal" component={Principal} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="NoUsers" component={NoUsersScreen} />
        <Stack.Screen name="Arquivos" component={FileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
