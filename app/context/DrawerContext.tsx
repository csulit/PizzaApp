import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useMemo, useState } from "react"

interface DrawerContextValue {
  /** Whether the drawer is currently open */
  isOpen: boolean
  /** Open the drawer */
  openDrawer: () => void
  /** Close the drawer */
  closeDrawer: () => void
  /** Toggle the drawer open/close state */
  toggleDrawer: () => void
  /** Internal setter for sync with Drawer component */
  setIsOpen: (open: boolean) => void
}

const DrawerContext = createContext<DrawerContextValue | undefined>(undefined)

interface DrawerProviderProps {
  children: ReactNode
}

/**
 * Provider component that manages drawer open/close state.
 * Wrap your Drawer component with this provider to enable
 * drawer control from anywhere in the app.
 */
export function DrawerProvider({ children }: DrawerProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = useCallback(() => setIsOpen(true), [])
  const closeDrawer = useCallback(() => setIsOpen(false), [])
  const toggleDrawer = useCallback(() => setIsOpen((prev) => !prev), [])

  const value = useMemo(
    () => ({
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      setIsOpen,
    }),
    [isOpen, openDrawer, closeDrawer, toggleDrawer],
  )

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}

/**
 * Hook to access drawer controls from any component.
 * Must be used within a DrawerProvider.
 *
 * @example
 * ```tsx
 * const { toggleDrawer } = useDrawer()
 * <DrawerIconButton onPress={toggleDrawer} />
 * ```
 */
export function useDrawer(): DrawerContextValue {
  const context = useContext(DrawerContext)
  if (context === undefined) {
    throw new Error("useDrawer must be used within a DrawerProvider")
  }
  return context
}
