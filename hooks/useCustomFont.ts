// hooks/useCustomFonts.ts

import { useFonts } from 'expo-font';
import { useState, useEffect } from 'react';

export default function useCustomFonts() {
  // Load your custom fonts here
  const [fontsLoaded] = useFonts({
    'PixelifySans-Regular': require('../assets/fonts/PixelifySans-Regular.ttf'),
    'Jacquard12-Regular': require('../assets/fonts/Jacquard12-Regular.ttf'),
    'Girassol-Regular': require('../assets/fonts/Girassol-Regular.ttf'),
  });

  // Return the fontsLoaded boolean to be used in components
  return fontsLoaded;
}