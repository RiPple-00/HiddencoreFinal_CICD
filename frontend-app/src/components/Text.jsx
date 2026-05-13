import { Text as RNText } from "react-native";

export default function Text({ className = "", ...props }) {
  return (
    <RNText
      className={`font-sans ${className}`}
      {...props}
    />
  );
}