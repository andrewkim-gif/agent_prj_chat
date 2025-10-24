/**
 * Cross Wallet Reset Utility
 * Completely resets Cross Wallet state to resolve "Connection declined" issues
 */

export async function resetCrossWalletState(): Promise<boolean> {
  try {
    console.log('🔄 Starting Cross Wallet state reset...')

    // 1. Clear all localStorage Cross-related data
    const allCrossKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('cross') ||
        key.includes('Cross') ||
        key.includes('nexus') ||
        key.includes('to-nexus') ||
        key.includes('@to-nexus')
      )) {
        allCrossKeys.push(key)
      }
    }
    allCrossKeys.forEach(key => {
      console.log(`Removing localStorage: ${key}`)
      localStorage.removeItem(key)
    })

    // 2. Clear all sessionStorage Cross-related data
    const allSessionKeys = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (
        key.includes('cross') ||
        key.includes('Cross') ||
        key.includes('nexus') ||
        key.includes('to-nexus') ||
        key.includes('@to-nexus')
      )) {
        allSessionKeys.push(key)
      }
    }
    allSessionKeys.forEach(key => {
      console.log(`Removing sessionStorage: ${key}`)
      sessionStorage.removeItem(key)
    })

    // 3. Find and reset Cross Wallet extension state
    const possibleNames = ['crossWallet', 'cross', 'Cross', 'CrossWallet']
    for (const name of possibleNames) {
      const wallet = (window as any)[name]
      if (wallet && typeof wallet.request === 'function') {
        console.log(`Found Cross Wallet at window.${name}, attempting reset...`)

        try {
          // Try to clear any pending requests/state
          const resetMethods = [
            'wallet_disconnect',
            'wallet_revokePermissions',
            'wallet_clearSession'
          ]

          for (const method of resetMethods) {
            try {
              await wallet.request({ method })
              console.log(`✅ ${method} successful`)
            } catch (e) {
              console.log(`⚠️ ${method} failed:`, e.message)
            }
          }

          // Force clear internal state if accessible
          if (wallet._state) wallet._state = {}
          if (wallet._pendingRequests) wallet._pendingRequests = []
          if (wallet._requests) wallet._requests = new Map()
          if (wallet.selectedAddress) wallet.selectedAddress = null

        } catch (walletError) {
          console.log(`Wallet reset error for ${name}:`, walletError)
        }
      }
    }

    // 4. Clear only Cross SDK objects, preserve wallet extension
    try {
      const windowKeys = Object.keys(window as any)
      const preserveKeys = ['crossWallet', 'cross', 'Cross', 'CrossWallet'] // Preserve wallet extension
      windowKeys.forEach(key => {
        if ((key.toLowerCase().includes('cross') || key.toLowerCase().includes('nexus')) &&
            !preserveKeys.includes(key) &&
            (key.includes('SDK') || key.includes('sdk') || key.includes('App') ||
             key.includes('Modal') || key.includes('Kit') || key.includes('Controller'))) {
          try {
            delete (window as any)[key]
            console.log(`Removed window.${key}`)
          } catch (e) {
            // Property might be non-configurable
          }
        }
      })
    } catch (globalError) {
      console.log('Global object cleanup error:', globalError)
    }

    console.log('✅ Cross Wallet state reset completed')
    return true

  } catch (error) {
    console.error('❌ Cross Wallet reset failed:', error)
    return false
  }
}

export function showResetInstructions(): void {
  const message = `
🔄 Cross Wallet Reset Required

To resolve connection issues:

1. Close Cross Wallet extension popup if open
2. Refresh this page (F5 or Ctrl+R)
3. Wait 5 seconds before trying to connect again
4. If still having issues, restart your browser

This will clear all pending connection requests.
  `
  console.log(message)
  alert(message.trim())
}

export async function performCompleteReset(): Promise<void> {
  try {
    await resetCrossWalletState()

    // Show instructions to user
    showResetInstructions()

    // Auto-refresh the page after user confirmation
    if (confirm('Would you like to refresh the page now to complete the reset?')) {
      window.location.reload()
    }
  } catch (error) {
    console.error('Complete reset failed:', error)
    alert('Reset failed. Please refresh the page manually and try again.')
  }
}