importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js')

const pyodideReadyPromise = loadPyodide()

let sharedBuffer = null
let interruptBuffer = null

self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    sharedBuffer = data.sharedBuffer
    interruptBuffer = data.interruptBuffer
    return
  }

  if (data.type === 'run') {
    try {
      const pyodide = await pyodideReadyPromise

      const statusArray = new Int32Array(sharedBuffer, 0, 2)
      const dataArray = new Uint8Array(sharedBuffer, 8)

      const interruptArray = new Int32Array(interruptBuffer)
      Atomics.store(interruptArray, 0, 0)
      pyodide.setInterruptBuffer(interruptArray)

      let stdoutBuffer = ''

      pyodide.setStdin({
        stdin: () => {
          Atomics.store(statusArray, 0, 0)
          self.postMessage({ type: 'stdin', text: stdoutBuffer })
          stdoutBuffer = ''
          Atomics.wait(statusArray, 0, 0)
          const length = Atomics.load(statusArray, 1)
          return new TextDecoder().decode(dataArray.slice(0, length)) + '\n'
        },
      })

      pyodide.setStdout({
        raw: (charCode) => {
          const char = String.fromCharCode(charCode)
          stdoutBuffer += char
          if (char === '\n') {
            self.postMessage({ type: 'stdout', text: stdoutBuffer })
            stdoutBuffer = ''
          }
        },
      })

      pyodide.setStderr({
        batched: (str) => self.postMessage({ type: 'stderr', text: str }),
      })

      data.files.forEach(async (file) => {
        pyodide.FS.writeFile(file.name, file.content, { encoding: 'utf8' })
        await pyodide.loadPackagesFromImports(file.content)
      })
      const entryFile = data.entryFile

      pyodide.runPython(
        `import runpy; runpy.run_path('${entryFile}', run_name='__main__')`,
      )

      if (stdoutBuffer) {
        self.postMessage({ type: 'stdout', text: stdoutBuffer })
      }

      self.postMessage({ type: 'done' })
    } catch (error) {
      console.log(error)
      self.postMessage({ type: 'stderr', text: error.message })
      self.postMessage({ type: 'done' })
    }
  }
}
