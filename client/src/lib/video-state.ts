// Simple global state for the prototype to share video between pages
type VideoState = {
  file: File | null
  url: string | null
}

let globalVideoState: VideoState = {
  file: null,
  url: null,
}

export const setVideo = (file: File) => {
  if (globalVideoState.url) {
    URL.revokeObjectURL(globalVideoState.url)
  }
  globalVideoState = {
    file,
    url: URL.createObjectURL(file),
  }
}

export const getVideo = () => globalVideoState
