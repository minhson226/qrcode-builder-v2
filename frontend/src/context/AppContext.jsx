import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  theme: 'light',
  notifications: [],
  qrCodes: [],
  analytics: null
}

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_QR_CODES: 'SET_QR_CODES',
  ADD_QR_CODE: 'ADD_QR_CODE',
  UPDATE_QR_CODE: 'UPDATE_QR_CODE',
  DELETE_QR_CODE: 'DELETE_QR_CODE',
  SET_ANALYTICS: 'SET_ANALYTICS'
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case actionTypes.SET_USER:
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        loading: false 
      }
    
    case actionTypes.LOGOUT:
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false,
        qrCodes: [],
        analytics: null
      }
    
    case actionTypes.SET_THEME:
      return { ...state, theme: action.payload }
    
    case actionTypes.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload
        }]
      }
    
    case actionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    
    case actionTypes.SET_QR_CODES:
      return { ...state, qrCodes: action.payload }
    
    case actionTypes.ADD_QR_CODE:
      return { 
        ...state, 
        qrCodes: [action.payload, ...state.qrCodes]
      }
    
    case actionTypes.UPDATE_QR_CODE:
      return {
        ...state,
        qrCodes: state.qrCodes.map(qr => 
          qr.id === action.payload.id ? action.payload : qr
        )
      }
    
    case actionTypes.DELETE_QR_CODE:
      return {
        ...state,
        qrCodes: state.qrCodes.filter(qr => qr.id !== action.payload)
      }
    
    case actionTypes.SET_ANALYTICS:
      return { ...state, analytics: action.payload }
    
    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize app (check for stored auth, theme, etc.)
  useEffect(() => {
    const initApp = async () => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      
      try {
        // Check for stored theme
        const storedTheme = localStorage.getItem('qr-builder-theme')
        if (storedTheme) {
          dispatch({ type: actionTypes.SET_THEME, payload: storedTheme })
        }

        // Check for stored auth token
        const token = localStorage.getItem('qr-builder-token')
        if (token) {
          // In a real app, validate token with server
          // For now, just simulate a user
          const user = { 
            id: '1', 
            email: 'demo@example.com', 
            name: 'Demo User' 
          }
          dispatch({ type: actionTypes.SET_USER, payload: user })
        }
      } catch (error) {
        console.error('App initialization error:', error)
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false })
      }
    }

    initApp()
  }, [])

  // Actions
  const actions = {
    setLoading: (loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading })
    },

    login: async (credentials) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      try {
        // In a real app, make API call to authenticate
        // For now, simulate successful login
        const user = { 
          id: '1', 
          email: credentials.email, 
          name: 'Demo User' 
        }
        const token = 'demo-jwt-token'
        
        localStorage.setItem('qr-builder-token', token)
        dispatch({ type: actionTypes.SET_USER, payload: user })
        
        actions.addNotification({
          type: 'success',
          title: 'Đăng nhập thành công',
          message: `Chào mừng ${user.name}!`
        })
        
        return { success: true, user }
      } catch (error) {
        actions.addNotification({
          type: 'error',
          title: 'Lỗi đăng nhập',
          message: error.message
        })
        return { success: false, error: error.message }
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false })
      }
    },

    logout: () => {
      localStorage.removeItem('qr-builder-token')
      dispatch({ type: actionTypes.LOGOUT })
      actions.addNotification({
        type: 'info',
        title: 'Đăng xuất thành công',
        message: 'Hẹn gặp lại bạn!'
      })
    },

    setTheme: (theme) => {
      localStorage.setItem('qr-builder-theme', theme)
      dispatch({ type: actionTypes.SET_THEME, payload: theme })
    },

    addNotification: (notification) => {
      dispatch({ type: actionTypes.ADD_NOTIFICATION, payload: notification })
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        actions.removeNotification(notification.id || Date.now())
      }, 5000)
    },

    removeNotification: (id) => {
      dispatch({ type: actionTypes.REMOVE_NOTIFICATION, payload: id })
    },

    setQrCodes: (qrCodes) => {
      dispatch({ type: actionTypes.SET_QR_CODES, payload: qrCodes })
    },

    addQrCode: (qrCode) => {
      dispatch({ type: actionTypes.ADD_QR_CODE, payload: qrCode })
    },

    updateQrCode: (qrCode) => {
      dispatch({ type: actionTypes.UPDATE_QR_CODE, payload: qrCode })
    },

    deleteQrCode: (qrId) => {
      dispatch({ type: actionTypes.DELETE_QR_CODE, payload: qrId })
    },

    setAnalytics: (analytics) => {
      dispatch({ type: actionTypes.SET_ANALYTICS, payload: analytics })
    }
  }

  const value = {
    ...state,
    actions
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export { actionTypes }