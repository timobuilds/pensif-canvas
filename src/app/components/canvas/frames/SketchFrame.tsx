'use client';

import { BaseShapeUtil, Rectangle2d, TLBaseShape } from '@tldraw/tldraw'

export interface SketchFrameShape extends TLBaseShape<'sketch-frame'> {
  props: {
    w: number
    h: number
    sketch?: string // base64 encoded image data
  }
}

export class SketchFrameUtil extends BaseShapeUtil<SketchFrameShape> {
  static type = 'sketch-frame' as const

  getDefaultProps(): SketchFrameShape['props'] {
    return {
      w: 320,
      h: 240,
      sketch: undefined,
    }
  }

  getBounds(shape: SketchFrameShape): Rectangle2d {
    return new Rectangle2d({
      x: shape.x,
      y: shape.y,
      w: shape.props.w,
      h: shape.props.h,
    })
  }

  component(shape: SketchFrameShape) {
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
        {/* Sketch area will go here */}
        <div className="absolute inset-2">
          {shape.props.sketch ? (
            <img 
              src={shape.props.sketch} 
              alt="Sketch"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              Click to start sketching
            </div>
          )}
        </div>
      </div>
    )
  }

  indicator(shape: SketchFrameShape) {
    const bounds = this.getBounds(shape)
    return <rect className="fill-none stroke-2" {...bounds} />
  }
}
