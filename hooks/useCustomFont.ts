import * as Font from 'expo-font';
import {useEffect, useState} from 'react';

export default function useCustomFonts()
{
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() =>
    {
        async function loadFonts()
        {
            await Font.loadAsync
            ({
            });
            setFontsLoaded(true);
        }
        loadFonts();
    }, []);

    return fontsLoaded;
}