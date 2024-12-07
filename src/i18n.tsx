import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { translations as en } from './assets/lang/en/lang';
import { translations as pt } from './assets/lang/pt/lang';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    pt: {
        translation: pt,
    },
    en: {
        translation: en,
    },
};

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: 'en',
        fallbackLng: {
            pt: ['en'],
            br: ['pt', 'en'],
            en: ['pt'], //TODO: remove this as soon as possible
            default: ['en'],
        },

        cleanCode: true,

        // saveMissing: true,
        parseMissingKeyHandler: (key: string, defaultValue?: string) => {
            return `Missing translation for key "${key}"`;
        },

        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export { i18n };
