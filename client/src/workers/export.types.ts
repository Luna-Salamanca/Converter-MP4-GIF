export type InitPaletteMessage = {
  type: 'INIT_PALETTE'
  payload: {
    samples: Uint8ClampedArray[]
    maxColors: number
  }
}

export type EncodeFrameMessage = {
  type: 'ENCODE_FRAME'
  payload: {
    frameData: Uint8ClampedArray
    width: number
    height: number
    delay: number
    index: number
  }
}

export type FinishMessage = { type: 'FINISH' }
export type CancelMessage = { type: 'CANCEL' }

export type WorkerRequest =
  | InitPaletteMessage
  | EncodeFrameMessage
  | FinishMessage
  | CancelMessage

export type WorkerResponse =
  | { type: 'PALETTE_READY' }
  | { type: 'FRAME_ENCODED'; payload: { frameIndex: number } }
  | { type: 'FINISHED'; payload: { buffer: ArrayBuffer } }
  | { type: 'ERROR'; payload: { error: string } }
