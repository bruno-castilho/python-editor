'use client'
import { useEffect, useRef, useState } from 'react'

export interface PythonFile {
  name: string
  content: string
}

export type PyodideStatus = 'idle' | 'running' | 'stopping'

interface usePyodideProps {
  stdoutCallback: (text: string) => void
  stderrCallback: (text: string) => void
  stdinCallback: (text: string) => void
}

const SHARED_BUFFER_SIZE = 4096 + 8

const sharedBuffer = new SharedArrayBuffer(SHARED_BUFFER_SIZE)
const interruptBuffer = new SharedArrayBuffer(4)

export function usePyodide({
  stdoutCallback,
  stderrCallback,
  stdinCallback,
}: usePyodideProps) {
  const [status, setStatus] = useState<PyodideStatus>('idle')

  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const worker = new Worker('/pyodide.worker.js')
    workerRef.current = worker

    worker.postMessage({
      type: 'init',
      sharedBuffer,
      interruptBuffer,
    })

    worker.onmessage = ({ data }) => {
      if (data.type === 'stdin') {
        stdinCallback(data.text)
      } else if (data.type === 'stdout') {
        stdoutCallback(data.text)
      } else if (data.type === 'stderr') {
        stderrCallback(data.text)
      } else if (data.type === 'done') {
        setStatus('idle')
      }
    }

    return () => {
      worker.terminate()
    }
  }, [])

  function runCode(files: PythonFile[], entryFile: string) {
    const worker = workerRef.current
    if (!worker) return
    setStatus('running')
    worker.postMessage({ type: 'run', files, entryFile })
  }

  function sendInput(text: string) {
    const statusArray = new Int32Array(sharedBuffer, 0, 2)
    const dataArray = new Uint8Array(sharedBuffer, 8)

    const encoded = new TextEncoder().encode(text)
    dataArray.set(encoded)
    Atomics.store(statusArray, 1, encoded.length)
    Atomics.store(statusArray, 0, 1)
    Atomics.notify(statusArray, 0)
  }

  function stopExecution() {
    setStatus('stopping')
    const interruptArray = new Int32Array(interruptBuffer)
    Atomics.store(interruptArray, 0, 2)

    const statusArray = new Int32Array(sharedBuffer, 0, 2)
    Atomics.store(statusArray, 1, 0)
    Atomics.store(statusArray, 0, 1)
    Atomics.notify(statusArray, 0)
  }

  return { status, runCode, sendInput, stopExecution }
}
