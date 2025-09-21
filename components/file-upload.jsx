"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, CheckCircle, AlertTriangle } from "lucide-react"

export default function FileUpload({ onFileSelect, acceptedTypes = [".txt", ".log", ".pdf"] }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [acceptedTypes],
  )

  const handleChange = useCallback(
    (e) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files)
      }
    },
    [acceptedTypes],
  )

  const handleFiles = (files) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter((file) => {
      const extension = "." + file.name.split(".").pop().toLowerCase()
      return acceptedTypes.includes(extension)
    })

    const newFiles = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      status: "ready", // ready, scanning, completed, error
      progress: 0,
      results: null,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])
    if (onFileSelect) {
      onFileSelect(newFiles)
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-chart-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "scanning":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">Upload Files for Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1">Drag and drop files here, or click to browse</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {acceptedTypes.map((type) => (
              <span key={type} className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                {type.toUpperCase()}
              </span>
            ))}
          </div>

          <Button variant="outline" className="mt-4 bg-transparent">
            Choose Files
          </Button>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Uploaded Files</h4>
          {uploadedFiles.map((fileItem) => (
            <div key={fileItem.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
              <div className="flex-shrink-0">{getStatusIcon(fileItem.status)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">{fileItem.name}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => removeFile(fileItem.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{formatFileSize(fileItem.size)}</p>

                {fileItem.status === "scanning" && (
                  <div className="mt-2">
                    <Progress value={fileItem.progress} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">Scanning... {fileItem.progress}%</p>
                  </div>
                )}

                {fileItem.status === "completed" && fileItem.results && (
                  <div className="mt-2 text-xs">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        fileItem.results.threat ? "bg-destructive/10 text-destructive" : "bg-chart-4/10 text-chart-4"
                      }`}
                    >
                      {fileItem.results.threat ? "Threat Detected" : "Clean"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
