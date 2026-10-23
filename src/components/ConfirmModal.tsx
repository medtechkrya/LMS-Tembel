'use client'

import { useState, useCallback, useRef } from 'react'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger'
}

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions | string): Promise<boolean> => {
    const normalized: ConfirmOptions = typeof opts === 'string' ? { message: opts } : opts
    setOptions(normalized)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const handleClose = useCallback((result: boolean) => {
    setOptions(null)
    if (resolverRef.current) {
      resolverRef.current(result)
      resolverRef.current = null
    }
  }, [])

  const ConfirmDialog = useCallback(() => {
    if (!options) return null
    const isDanger = options.variant === 'danger'
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1A0E]/30 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => handleClose(false)}
      >
        <div
          className="bg-white rounded-3xl border border-[#E8D5B7]/60 shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-150"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-[16px] font-bold text-[#2C1A0E] mb-2">
            {options.title || (isDanger ? 'Confirm Delete' : 'Confirmation')}
          </h3>
          <p className="text-[13.5px] text-[#6B5744] leading-relaxed mb-6">
            {options.message}
          </p>
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#6B5744] bg-[#FAFAF8] border border-[#E8D5B7]/80 hover:bg-[#E8D5B7]/20 hover:text-[#2C1A0E] transition-colors"
            >
              {options.cancelText || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => handleClose(true)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-all ${
                isDanger
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-[#F5A623] text-[#2C1A0E] hover:bg-[#E09615]'
              }`}
            >
              {options.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    )
  }, [options, handleClose])

  return { confirm, ConfirmDialog }
}
