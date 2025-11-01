import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export type Language = 'zh-CN' | 'en-US';

// Global state
let currentLanguage: Language = 'zh-CN';

const translations = {
  'zh-CN': zhCN,
  'en-US': enUS
};

const formatMessage = (message: string, params?: Record<string, any>): string => {
  if (!params) return message;
  
  let formatted = message;
  for (const [key, value] of Object.entries(params)) {
    formatted = formatted.replace(`{${key}}`, String(value));
  }
  return formatted;
};

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
};

export const getLanguage = (): Language => {
  return currentLanguage;
};

export const t = (key: string, params?: Record<string, any>): string => {
  const keys = key.split('.');
  let current: any = translations[currentLanguage];
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to English if key not found
      current = translations['en-US'];
      for (const k2 of keys) {
        if (current && typeof current === 'object' && k2 in current) {
          current = current[k2];
        } else {
          return key; // Return the key if not found in any language
        }
      }
      break;
    }
  }
  
  if (typeof current === 'string') {
    return formatMessage(current, params);
  }
  
  return key;
};

// Export for backward compatibility
export const useT = () => t;