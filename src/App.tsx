// import logo from './logo.svg'
import { createGenerateClassName, StylesProvider } from '@mui/styles'
import { useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'
import './App.css'
import ChatContainer from './components/ChatContainer'
import de from './intl/de.json'
import en from './intl/en.json'
import fr from './intl/fr.json'
import ja from './intl/ja.json'
import ko from './intl/ko.json'
import vi from './intl/vi.json'
import zh from './intl/zh.json'
import './locationchange'
import { isEmpty, getConfig } from './utils/helpers'

const generateClassName = createGenerateClassName({
  productionPrefix: 'vnt',
})

const App = () => {
  const configureVnt = getConfig()
  const defaultLang = configureVnt?.defaultLang || 'vi'

  const [localeIntl, setLocaleIntl] = useState<any>()
  const getKeyLanguage = (url: string) => {
    if (!isEmpty(url?.toString())) {
      const arrayPathname = url?.toString()?.split('/')
      if (
        ['vi', 'en', 'ko', 'zh', 'ja', 'de', 'fr'].includes(arrayPathname[1])
      ) {
        return arrayPathname[1]
      }
      return defaultLang
    } else {
      return defaultLang
    }
  }
  const getJsonLanguage = (key: string) => {
    switch (key) {
      case 'vi':
        return vi
      case 'en':
        return en
      case 'ko':
        return ko
      case 'zh':
        return zh
      case 'ja':
        return ja
      case 'de':
        return de
      case 'fr':
        return fr
      default:
        return vi
    }
  }
  useEffect(() => {
    window.addEventListener('locationchange', () => {
      const key = getKeyLanguage(window.location.pathname)
      setLocaleIntl({
        locale: key,
        messages: getJsonLanguage(key),
      })
    })
    return () => {
      window.removeEventListener('locationchange', () => {
        const key = getKeyLanguage(window.location.pathname)
        setLocaleIntl({
          locale: key,
          messages: getJsonLanguage(key),
        })
      })
    }
  }, [])
  useEffect(() => {
    const key = getKeyLanguage(window.location.pathname)
    if (!isEmpty(key)) {
      setLocaleIntl({
        locale: key,
        messages: getJsonLanguage(key),
      })
    }
  }, [])
  return (
    <StylesProvider generateClassName={generateClassName}>
      <IntlProvider {...localeIntl}>
        <ChatContainer />
      </IntlProvider>
    </StylesProvider>
  )
}

export default App
