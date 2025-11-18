import { Redirect, Stack } from "expo-router";
import { theme } from "@/constants/theme";
import "react-native-reanimated";
import { Text, View } from "react-native";
import { useAuthSession } from "@/providers/authctx";

export default function RootLayout() {
  const { user, isLoading } = useAuthSession();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={{ color: theme.colors.textPrimary }}>
          Henter bruker...
        </Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href={"/authentication"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: "white",
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="post-details" />
      <Stack.Screen name="declarations" />
      <Stack.Screen name="post-details/[id]" />
    </Stack>
  );
}
