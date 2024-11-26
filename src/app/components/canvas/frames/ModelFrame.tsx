'use client';

import { BaseShapeUtil, Rectangle2d, TLBaseShape } from '@tldraw/tldraw'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

export interface ModelFrameShape extends TLBaseShape<'model-frame'> {
  props: {
    w: number
    h: number
    modelUrl?: string
    isLoading?: boolean
    isProcessing?: boolean
  }
}

export class ModelFrameUtil extends BaseShapeUtil<ModelFrameShape> {
  static type = 'model-frame' as const

  getDefaultProps(): ModelFrameShape['props'] {
    return {
      w: 320,
      h: 320,
      modelUrl: undefined,
      isLoading: false,
      isProcessing: false,
    }
  }

  getBounds(shape: ModelFrameShape): Rectangle2d {
    return new Rectangle2d({
      x: shape.x,
      y: shape.y,
      w: shape.props.w,
      h: shape.props.h,
    })
  }

  component(shape: ModelFrameShape) {
    const bounds = this.getBounds(shape)

    return (
      <div
        className="relative bg-neutral-800 border-2 border-neutral-600 rounded-lg overflow-hidden"
        style={{
          width: bounds.w,
          height: bounds.h,
        }}
      >
        {/* Left connector */}
        <div className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-600 z-10">
          +
        </div>
        {/* Right connector */}
        <div className="absolute right-0 top-1/2 translate-x-3 -translate-y-1/2 w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-600 z-10">
          +
        </div>
        
        {/* Model viewer */}
        <div className="absolute inset-0">
          {shape.props.isLoading || shape.props.isProcessing ? (
            <div className="w-full h-full flex items-center justify-center text-4xl animate-pulse">
              💟
            </div>
          ) : shape.props.modelUrl ? (
            <Suspense fallback={<div>Loading...</div>}>
              <Canvas>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <OrbitControls />
                {/* We'll add the 3D model component here */}
              </Canvas>
            </Suspense>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              Connect to an ImageFrame to generate 3D
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-neutral-700/50 flex gap-2 justify-center">
          <button 
            className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm text-neutral-100"
            onClick={() => {/* Reset view */}}
          >
            Reset
          </button>
          <button 
            className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm text-neutral-100"
            onClick={() => {/* Remove background */}}
          >
            Remove BG
          </button>
          <button 
            className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm text-neutral-100"
            onClick={() => {/* Generate 3D */}}
          >
            Generate 3D
          </button>
        </div>
      </div>
    )
  }

  indicator(shape: ModelFrameShape) {
    const bounds = this.getBounds(shape)
    return <rect className="fill-none stroke-2" {...bounds} />
  }
}
