import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "dashboad" }} />
      <Stack.Screen name="manage-food" options={{ title: "Manage Food" }} />
      <Stack.Screen name="orders" options={{ title: "Orders" }} />
      <Stack.Screen name="food-list" options={{ title: "Food list" }} />
    </Stack>
  );
}
