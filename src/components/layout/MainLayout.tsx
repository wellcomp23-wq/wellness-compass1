import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { BottomTabBar } from "./BottomTabBar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 container mx-auto px-4 py-8 pb-24 lg:pb-8">
            {children}
          </main>
          
          <BottomTabBar />
        </div>
      </div>
    </div>
  )
}
