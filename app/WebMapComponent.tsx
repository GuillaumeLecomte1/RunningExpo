import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export const WebMapComponent = () => {
  return (
    <View style={styles.container}>
      <ThemedText>La carte n'est pas disponible sur le web</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
