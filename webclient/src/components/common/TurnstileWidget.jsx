import React, { useEffect, useRef } from 'react'

export default function TurnstileWidget({ siteKey, onVerify, onError }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    if (!siteKey) return

    let isMounted = true

    function renderWidget() {
      if (!window.turnstile || !containerRef.current) return
      try {
        if (widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            if (isMounted && onVerify) onVerify(token)
          },
          'error-callback': () => {
            if (isMounted && onError) onError()
          },
        })
      } catch (err) {
        console.warn('Turnstile render warning:', err)
      }
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      const scriptId = 'cloudflare-turnstile-script'
      let script = document.getElementById(scriptId)
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.onload = () => {
          if (isMounted) renderWidget()
        }
        document.head.appendChild(script)
      } else {
        const checkInterval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkInterval)
            if (isMounted) renderWidget()
          }
        }, 100)
        setTimeout(() => clearInterval(checkInterval), 5000)
      }
    }

    return () => {
      isMounted = false
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // ignore
        }
      }
    }
  }, [siteKey])

  if (!siteKey) return null

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef}></div>
    </div>
  )
}
