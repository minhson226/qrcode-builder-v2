import React from 'react'
import { useApp } from '../context/AppContext.jsx'

function NotificationItem({ notification, onRemove }) {
  const { type, title, message } = notification

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  const bgColors = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800'
  }

  return (
    <div className={`alert ${bgColors[type]} mb-2 flex items-start gap-3 relative animate-slide-in`}>
      <span className="text-xl">{icons[type]}</span>
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        {message && <p className="text-sm">{message}</p>}
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="absolute top-2 right-2 text-lg hover:opacity-75 transition-opacity"
      >
        ×
      </button>
    </div>
  )
}

function NotificationCenter() {
  const { notifications, actions } = useApp()

  if (notifications.length === 0) return null

  return (
    <div 
      className="fixed top-4 right-4 z-50 max-w-sm space-y-2"
      style={{ zIndex: 9999 }}
    >
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={actions.removeNotification}
        />
      ))}
    </div>
  )
}

export default NotificationCenter