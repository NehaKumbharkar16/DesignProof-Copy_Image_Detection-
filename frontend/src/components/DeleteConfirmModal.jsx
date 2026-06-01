import React from 'react'

export default function DeleteConfirmModal({ open, title='Confirm delete', message, onConfirm, onCancel, confirmLabel='Delete', cancelLabel='Cancel' }){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg max-w-lg w-full p-6">
        <div className="text-lg font-semibold mb-2">{title}</div>
        <div className="text-sm text-slate-600 mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-outline">{cancelLabel}</button>
          <button onClick={onConfirm} className="btn-gradient text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
