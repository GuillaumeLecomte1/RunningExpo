import { Text, TextProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function ThemedText(props: TextProps) {
  const { isDarkMode } = useTheme();
  const { style, ...otherProps } = props;

  return (
    <Text
      style={[
        { color: isDarkMode ? '#FFFFFF' : '#000000' },
        style
      ]}
      {...otherProps}
    />
  );
}
