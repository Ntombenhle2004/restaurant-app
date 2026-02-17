import { Stack } from "expo-router";
import { Text } from "react-native";

const GOLD_COLOR = "#D4AF37";

const Title = () => (
  <Text
    style={{
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 3,
      color: GOLD_COLOR,
    }}
  >
    AMBROSIA
  </Text>
);

export default function AdminLayout() {
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
        name="index"
        options={{
          headerTitle: () => <Title />,
        }}
      />

      <Stack.Screen
        name="manage-food"
        options={{
          headerTitle: () => <Title />,
        }}
      />

      <Stack.Screen
        name="orders"
        options={{
          headerTitle: () => <Title />,
        }}
      />

      <Stack.Screen
        name="food-list"
        options={{
          headerTitle: () => <Title />,
        }}
      />
    </Stack>
  );
}
