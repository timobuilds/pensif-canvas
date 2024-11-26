'use client';

import { BaseShapeUtil, Rectangle2d, TLBaseShape } from '@tldraw/tldraw'

export interface ImageFrameShape extends TLBaseShape<'image-frame'> {
  props: {
    w: number
    h: number
    image?: string
    prompt?: string
    isLoading?: boolean
  }
}

export class ImageFrameUtil extends BaseShapeUtil<ImageFrameShape> {
  static type = 'image-frame' as const

  getDefaultProps(): ImageFrameShape['props'] {
    return {
      w: 320,
      h: 320,
      image: undefined,
      prompt: '',
      isLoading: false,
    }
  }

  getBounds(shape: ImageFrameShape): Rectangle2d {
    return new Rectangle2d({
      x: shape.x,
      y: shape.y,
      w: shape.props.w,
      h: shape.props.h,
    })
  }

  component(shape: ImageFrameShape) {
    const bounds = this.getBounds(shape)

    return (
      <div
        className="relative bg-neutral-800 border-2 border-neutral-600 rounded-lg"
        style={{
          width: bounds.w,
          height: bounds.h,
        }}
      >
        {/* Left connector */}
        <div className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-600">
          +
        </div>
        {/* Right connector */}
        <div className="absolute right-0 top-1/2 translate-x-3 -translate-y-1/2 w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-600">
          +
        </div>
        {/* Image area */}
        <div className="absolute inset-2">
          {shape.props.isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-4xl animate-pulse">
              💟
            </div>
          ) : shape.props.image ? (
            <img 
              src={shape.props.image} 
              alt="Generated"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              Enter prompt below
            </div>
          )}
        </div>
        {/* Prompt input */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-neutral-700/50">
          <input
            type="text"
            value={shape.props.prompt}
            placeholder="Enter prompt for image generation..."
            className="w-full px-2 py-1 bg-neutral-800 border border-neutral-600 rounded text-sm text-neutral-100 placeholder-neutral-400"
            onChange={() => {
              // We'll implement this in the Canvas component
            }}
          />
        </div>
      </div>
    )
  }

  indicator(shape: ImageFrameShape) {
    const bounds = this.getBounds(shape)
    return <rect className="fill-none stroke-2" {...bounds} />
  }
}
