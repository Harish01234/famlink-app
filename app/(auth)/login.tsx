import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://168.231.123.52:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
        return;
      }

      // Save token & role securely
      await SecureStore.setItemAsync("token", data.token);
      await SecureStore.setItemAsync("role", data.user.role);

      // Redirect based on role
      if (data.user.role === "parent") {
        router.replace("/(parents)/home");
      } else {
        router.replace("/(children)/dashboard");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: 25,
        justifyContent: "center",
      }}
    >
      {/* Logo */}
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <Image
          source={require("../../assets/images/famlink.png")}
          style={{ width: 120, height: 120, resizeMode: "contain" }}
        />
      </View>

      <Text
        style={{
          color: COLORS.navy,
          fontSize: 28,
          fontWeight: "700",
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        Welcome Back
      </Text>

      {/* Email Input */}
      <View
        style={{
          backgroundColor: COLORS.grey,
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
        }}
      >
        <TextInput
          placeholder="Email"
          placeholderTextColor="#7A7A7A"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input */}
      <View
        style={{
          backgroundColor: COLORS.grey,
          padding: 15,
          borderRadius: 10,
          marginBottom: 25,
        }}
      >
        <TextInput
          placeholder="Password"
          placeholderTextColor="#7A7A7A"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: COLORS.primary,
          paddingVertical: 15,
          borderRadius: 10,
          alignItems: "center",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text
          style={{
            color: COLORS.white,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <TouchableOpacity
        onPress={() => router.push("/(auth)/register")}
        style={{ marginTop: 20 }}
      >
        <Text
          style={{
            color: COLORS.navy,
            textAlign: "center",
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          Don’t have an account?{" "}
          <Text style={{ color: COLORS.primary }}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
