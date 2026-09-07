'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, ImagePlus, X } from 'lucide-react'

type ImagePickerProps = {
  label?: string
  urdu?: string
  value: File | null
  previewUrl: string | null
  onChange: (file: File | null, previewUrl: string | null) => void
  onError?: (message: string) => void
  hint?: string
  allowCamera?: boolean
}

export default function ImagePicker({
  label,
  urdu,
  value,
  previewUrl,
  onChange,
  onError,
  hint = 'JPG, PNG, or WebP · Max 5 MB',
  allowCamera = true,
}: ImagePickerProps) {
  const [mode, setMode] = useState<'file' | 'camera'>('file')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraReady(false)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (mode !== 'camera') {
      stopCamera()
      return
    }

    let cancelled = false
    const start = async () => {
      setCameraError(null)
      setCameraReady(false)
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera is not supported on this device.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch {
        setCameraError('Unable to access camera. Please allow camera permission.')
      }
    }
    void start()
    return () => {
      cancelled = true
      stopCamera()
    }
  }, [mode])

  const applyFile = (file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      onChange(null, null)
      onError?.('Please choose an image smaller than 5 MB.')
      return
    }
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onChange(null, null)
      onError?.('Only JPG, PNG, and WebP images are supported.')
      return
    }
    onError?.('')
    onChange(file, file ? URL.createObjectURL(file) : null)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video || !cameraReady) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
        applyFile(file)
        setMode('file')
      },
      'image/jpeg',
      0.92
    )
  }

  return (
    <div className="space-y-2">
      {(label || urdu) && (
        <p className="text-sm font-medium text-slate-700">
          {label} {urdu && <span className="font-urdu text-slate-400">{urdu}</span>}
        </p>
      )}

      {allowCamera && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              mode === 'file'
                ? 'border-primary-300 bg-primary-50 text-primary-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ImagePlus className="h-3.5 w-3.5" /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              mode === 'camera'
                ? 'border-primary-300 bg-primary-50 text-primary-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Camera className="h-3.5 w-3.5" /> Camera
          </button>
        </div>
      )}

      {mode === 'file' ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-3">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus className="h-6 w-6 text-slate-400" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">
                {value ? value.name : 'Choose a picture'}
              </p>
              <p className="mt-1 text-xs text-slate-400">{hint}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Browse
                </button>
                {value && (
                  <button
                    type="button"
                    onClick={() => applyFile(null)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-error-600 hover:bg-error-50"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            {...(allowCamera ? { capture: 'environment' as const } : {})}
            className="hidden"
            onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
          />
        </div>
      ) : (
        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900">
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            {!cameraReady && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white/80">
                Starting camera...
              </div>
            )}
          </div>
          {cameraError && <p className="text-xs text-error-600">{cameraError}</p>}
          <button
            type="button"
            onClick={capturePhoto}
            disabled={!cameraReady}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" /> Capture Photo
          </button>
        </div>
      )}
    </div>
  )
}
