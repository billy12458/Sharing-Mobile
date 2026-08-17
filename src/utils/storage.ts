const LANGUAGE_KEY = 'qs-mobile-language'

export function getSavedLanguage(): 'zh-CN' | 'en-US' | null {
  const value = localStorage.getItem(LANGUAGE_KEY)
  return value === 'zh-CN' || value === 'en-US' ? value : null
}

export function saveLanguage(locale: 'zh-CN' | 'en-US') {
  localStorage.setItem(LANGUAGE_KEY, locale)
}
