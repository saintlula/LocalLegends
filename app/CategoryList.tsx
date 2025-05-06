import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function CategoryList() {
  const { category } = useLocalSearchParams();
  return (
    <View style={{ padding: 20 }}>
      <Text>Category List: {category}</Text>
      <Text>(This is a placeholder screen for category stories)</Text>
    </View>
  );
}
