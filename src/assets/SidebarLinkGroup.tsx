// // src/components/common/SidebarLinkGroup.tsx
// import { ReactNode, useEffect, useState } from 'react'
// import { colors } from '@/constants/colorsThema'

// interface SidebarLinkGroupProps {
//   label: string
//   icon?: ReactNode
//   children: ReactNode
// }

// export default function SidebarLinkGroup({
//   label,
//   icon,
//   children,
// }: SidebarLinkGroupProps) {
//   const [isDark, setIsDark] = useState(false)

//   useEffect(() => {
//     setIsDark(document.documentElement.classList.contains('dark'))
//   }, [])

//   const theme = isDark ? colors.dark : colors.light

//   return (
//     <div className="w-full px-2">
//       <div
//         className="flex items-center gap-2 mb-2 text-xs font-semibold px-2"
//         style={{ color: theme.silver2 }}
//       >
//         {icon && <div className="text-base">{icon}</div>}
//         {label}
//       </div>
//       <div className="space-y-1">{children}</div>
//     </div>
//   )
// }
