import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import Colors from "@/constants/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  secureTextEntry?: boolean;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  secureTextEntry = false,
  fullWidth = false,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View 
      style={[
        styles.container, 
        fullWidth && styles.fullWidth,
        containerStyle
      ]}
      testID="input-container"
    >
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.focusedInput,
            error && styles.errorInput,
            secureTextEntry && styles.passwordInput,
            inputStyle,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor={Colors.light.textSecondary}
          {...rest}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={togglePasswordVisibility}
            testID="toggle-password-visibility"
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={Colors.light.textSecondary} />
            ) : (
              <Eye size={20} color={Colors.light.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  fullWidth: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.light.text,
    fontWeight: "500",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    color: Colors.light.text,
  },
  passwordInput: {
    paddingRight: 50,
  },
  focusedInput: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
  },
  errorInput: {
    borderColor: Colors.light.error,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 14,
  },
});