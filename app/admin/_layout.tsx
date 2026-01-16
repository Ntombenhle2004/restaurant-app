import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Index" }} />
      <Stack.Screen name="manage-food" options={{ title: "Manage Food" }} />
    </Stack>
  );
}
