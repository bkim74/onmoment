import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/main', label: '홈', icon: '🏠' },
  { to: '/timeline', label: '여정', icon: '📅' },
  { to: '/settings', label: '설정', icon: '⚙️' },
]

export default function TabBar() {
  return (
    <nav className="flex items-center justify-around border-t border-purple-100 bg-white/80 backdrop-blur-md pb-safe">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center py-3 px-6 min-w-touch transition-colors ${
              isActive ? 'text-om-purple' : 'text-gray-400'
            }`
          }
        >
          <span className="text-xl mb-0.5">{tab.icon}</span>
          <span className="text-xs font-medium">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
