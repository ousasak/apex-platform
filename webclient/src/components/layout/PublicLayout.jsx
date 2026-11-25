import React from 'react'
import { Outlet } from 'react-router-dom'
import AppNavbar from '@/components/layout/AppNavbar'
import AppFooter from '@/components/layout/AppFooter'
import StarfieldBg from '@/components/common/StarfieldBg'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-900 transition-colors duration-500">
      <StarfieldBg />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-mesh opacity-70 dark:opacity-100"
        aria-hidden="true"
      />
      <AppNavbar />
      <main className="flex-1 relative z-10 pt-[72px]">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}
