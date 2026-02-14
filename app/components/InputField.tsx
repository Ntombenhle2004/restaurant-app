import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardTypeOptions,
} from "react-native";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
};

export default function InputField({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  placeholder,
  keyboardType = "default",
  maxLength,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
    marginBottom: 5,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
    fontSize: 15,
    color: "#000",
    // Removes the default focus ring on web
    ...Platform.select({
      web: { outlineStyle: "none" } as any,
    }),
  },
});
