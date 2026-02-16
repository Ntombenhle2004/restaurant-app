import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { usePaystack } from "react-native-paystack-webview";

interface CheckoutProps {
  email: string;
  totalAmount: number;
  onSuccess: (ref: string) => Promise<void>;
}

const Checkout: React.FC<CheckoutProps> = ({
  email,
  totalAmount,
  onSuccess,
}) => {
  const { popup } = usePaystack();

  const handlePay = () => {

    const finalAmount = totalAmount;

    popup.checkout({
      email,
      amount: finalAmount,
      onSuccess: async (res: any) => {
        try {
          await onSuccess(res.reference);
          // This is the success message you wanted
          Alert.alert("Success", "Successfully paid");
        } catch (err) {
          Alert.alert("Error", "Order failed to save.");
        }
      },
      onCancel: () => {
        Alert.alert("Cancelled", "Payment was cancelled");
      },
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePay}>
      <Text style={styles.buttonText}>PLACE ORDER</Text>
    </TouchableOpacity>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "black",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

