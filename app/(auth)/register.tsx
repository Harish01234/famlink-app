import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Register() {
  const router = useRouter();

  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"parent" | "child" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert("Missing Fields", "Please fill all fields including role");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://168.231.123.52:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Registration Failed", data.message || "Try again");
        return;
      }

      // Save user token and role securely
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
      <View style={{ alignItems: "center", marginBottom: 30 }}>
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
          marginBottom: 25,
          textAlign: "center",
        }}
      >
        Create Account
      </Text>

      {/* Name Input */}
      <View
        style={{
          backgroundColor: COLORS.grey,
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
        }}
      >
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#7A7A7A"
          value={name}
          onChangeText={setName}
        />
      </View>

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
          marginBottom: 15,
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

      {/* Role Selector */}
      <Text
        style={{
          color: COLORS.navy,
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 10,
        }}
      >
        Select Role
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 25,
        }}
      >
        <TouchableOpacity
          onPress={() => setRole("parent")}
          style={{
            flex: 1,
            marginRight: 10,
            paddingVertical: 14,
            borderRadius: 10,
            backgroundColor: role === "parent" ? COLORS.primary : COLORS.grey,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: role === "parent" ? COLORS.white : COLORS.navy,
              fontWeight: "600",
            }}
          >
            Parent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRole("child")}
          style={{
            flex: 1,
            marginLeft: 10,
            paddingVertical: 14,
            borderRadius: 10,
            backgroundColor: role === "child" ? COLORS.primary : COLORS.grey,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: role === "child" ? COLORS.white : COLORS.navy,
              fontWeight: "600",
            }}
          >
            Child
          </Text>
        </TouchableOpacity>
      </View>

      {/* Register Button */}
      <TouchableOpacity
        onPress={handleRegister}
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
          {loading ? "Creating..." : "Register"}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <TouchableOpacity
        onPress={() => router.push("/(auth)/login")}
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
          Already have an account?{" "}
          <Text style={{ color: COLORS.primary }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
