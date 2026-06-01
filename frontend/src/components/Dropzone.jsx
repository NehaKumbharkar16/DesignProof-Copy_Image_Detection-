import React from 'react'
import {useDropzone} from 'react-dropzone'

export default function Dropzone({onFiles}){
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop: acceptedFiles => onFiles && onFiles(acceptedFiles),
    accept: {'image/*': []}
  })

  return (
    <div {...getRootProps()} className="border-dashed border-2 border-slate-200 p-6 rounded text-center bg-white cursor-pointer">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-slate-600">Drop the files here ...</p>
      ) : (
        <p className="text-slate-600">Drag & drop images here, or click to choose files</p>
      )}
    </div>
  )
}
