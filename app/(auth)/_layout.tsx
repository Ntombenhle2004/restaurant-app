import { Stack } from "expo-router";
import { Text } from "react-native";

const GOLD_COLOR = "#D4AF37";

const Title = () => (
  <Text
    style={{
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 5,
      color: GOLD_COLOR,
    }}
  >
    AMBROSIA
  </Text>
);

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
     
        
        headerStyle: {
          backgroundColor: "#000",
        },
        headerTintColor: GOLD_COLOR,

     
        headerLeft: () => null,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerTitle: () => <Title />,
        }}
      />

      <Stack.Screen
        name="register"
        options={{
          headerTitle: () => <Title />,
        }}
      />
    </Stack>
  );
}
