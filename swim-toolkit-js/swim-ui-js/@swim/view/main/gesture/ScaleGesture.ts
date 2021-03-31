// Copyright 2015-2020 Swim inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type {BoxR2} from "@swim/math";
import type {AnyTiming, ContinuousScale} from "@swim/mapping";
import type {ViewContext} from "../ViewContext";
import {View} from "../View";
import type {ViewObserver} from "../ViewObserver";
import type {GestureInputType} from "./GestureInput";
import {AbstractMomentumGesture} from "./MomentumGesture";
import type {ScaleGestureDelegate} from "./ScaleGestureDelegate";
import {ScaleGestureInput} from "./ScaleGestureInput";

export class AbstractScaleGesture<X, Y, V extends View> extends AbstractMomentumGesture<V> implements ViewObserver<V> {
  constructor(view: V | null, delegate: ScaleGestureDelegate<X, Y> | null = null) {
    super(view, delegate);
    Object.defineProperty(this, "needsRescale", {
      value: false,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly delegate: ScaleGestureDelegate<X, Y> | null

  setDelegate(delegate: ScaleGestureDelegate<X, Y> | null): void {
    Object.defineProperty(this, "delegate", {
      value: delegate,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly inputs: {readonly [inputId: string]: ScaleGestureInput<X, Y> | undefined};

  getInput(inputId: string | number): ScaleGestureInput<X, Y> | null {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    const input = this.inputs[inputId];
    return input !== void 0 ? input : null;
  }

  protected createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
                        x: number, y: number, t: number): ScaleGestureInput<X, Y> {
    return new ScaleGestureInput<X, Y>(inputId, inputType, isPrimary, x, y, t);
  }

  protected getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                             x: number, y: number, t: number): ScaleGestureInput<X, Y> {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    const inputs = this.inputs as {[inputId: string]: ScaleGestureInput<X, Y> | undefined};
    let input = inputs[inputId];
    if (input === void 0) {
      input = this.createInput(inputId, inputType, isPrimary, x, y, t);
      inputs[inputId] = input;
      Object.defineProperty(this, "inputCount", {
        value: this.inputCount + 1,
        enumerable: true,
        configurable: true,
      });
    }
    return input;
  }

  wheel(): boolean;
  wheel(wheel: boolean): this;
  wheel(wheel?: boolean): boolean | this {
    if (wheel === void 0) {
      return false;
    } else {
      return this;
    }
  }

  protected get distanceMin(): number {
    const delegate = this.delegate;
    if (delegate !== null && delegate.distanceMin !== void 0) {
      return delegate.distanceMin();
    } else {
      return ScaleGesture.DistanceMin;
    }
  }

  protected get preserveAspectRatio(): boolean {
    const delegate = this.delegate;
    if (delegate !== null && delegate.preserveAspectRatio !== void 0) {
      return delegate.preserveAspectRatio();
    } else {
      return true;
    }
  }

  xGestures(): boolean {
    const delegate = this.delegate;
    if (delegate !== null && delegate.xGestures !== void 0) {
      return delegate.xGestures();
    } else {
      return true;
    }
  }

  yGestures(): boolean {
    const delegate = this.delegate;
    if (delegate !== null && delegate.yGestures !== void 0) {
      return delegate.yGestures();
    } else {
      return true;
    }
  }

  xScale(): ContinuousScale<X, number> | null;
  xScale(xScale: ContinuousScale<X, number> | null, timing?: AnyTiming | boolean): this;
  xScale(xScale?: ContinuousScale<X, number> | null,
         timing?: AnyTiming | boolean): ContinuousScale<X, number> | null | this {
    const delegate = this.delegate;
    if (xScale === void 0) {
      if (delegate !== null && delegate.xScale !== void 0) {
        if (delegate.xGestures === void 0 || delegate.xGestures()) {
          return delegate.xScale();
        }
      }
      return null;
    } else {
      if (delegate !== null && delegate.xScale !== void 0) {
        if (delegate.xGestures === void 0 || delegate.xGestures()) {
          delegate.xScale(xScale);
        }
      }
      return this;
    }
  }

  yScale(): ContinuousScale<Y, number> | null;
  yScale(yScale: ContinuousScale<Y, number> | null, timing?: AnyTiming | boolean): this;
  yScale(yScale?: ContinuousScale<Y, number> | null,
         timing?: AnyTiming | boolean): ContinuousScale<Y, number> | null | this {
    const delegate = this.delegate;
    if (yScale === void 0) {
      if (delegate !== null && delegate.yScale !== void 0) {
        if (delegate.yGestures === void 0 || delegate.yGestures()) {
          return delegate.yScale();
        }
      }
      return null;
    } else {
      if (delegate !== null && delegate.yScale !== void 0) {
        if (delegate.yGestures === void 0 || delegate.yGestures()) {
          delegate.yScale(yScale);
        }
      }
      return this;
    }
  }

  protected clientToRangeX(clientX: number, xScale: ContinuousScale<X, number>, bounds: BoxR2): number {
    const viewX = clientX - bounds.xMin;
    const xRange = xScale.range;
    if (xRange[0] <= xRange[1]) {
      return xRange[0] + viewX;
    } else {
      return bounds.xMax + viewX - xRange[0];
    }
  }

  protected clientToRangeY(clientY: number, yScale: ContinuousScale<Y, number>, bounds: BoxR2): number {
    const viewY = clientY - bounds.yMin;
    const yRange = yScale.range;
    if (yRange[0] <= yRange[1]) {
      return yRange[0] + viewY;
    } else {
      return bounds.yMax + viewY - yRange[0];
    }
  }

  protected unscaleX(clientX: number, xScale: ContinuousScale<X, number>, bounds: BoxR2): X {
    return xScale.inverse(this.clientToRangeX(clientX, xScale, bounds));
  }

  protected unscaleY(clientY: number, yScale: ContinuousScale<Y, number>, bounds: BoxR2): Y {
    return yScale.inverse(this.clientToRangeY(clientY, yScale, bounds));
  }

  /** @hidden */
  declare readonly needsRescale: boolean;

  viewWillAnimate(viewContext: ViewContext): void {
    super.viewWillAnimate(viewContext);
    if (this.needsRescale) {
      this.rescale();
    }
  }

  protected onBeginPress(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onBeginPress(input, event);
    this.updateInputDomain(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    Object.defineProperty(this, "needsRescale", {
      value: true,
      enumerable: true,
      configurable: true,
    });
  }

  protected onMovePress(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onMovePress(input, event);
    this.view!.requireUpdate(View.NeedsAnimate);
    Object.defineProperty(this, "needsRescale", {
      value: true,
      enumerable: true,
      configurable: true,
    });
  }

  protected onEndPress(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onEndPress(input, event);
    this.updateInputDomain(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    Object.defineProperty(this, "needsRescale", {
      value: true,
      enumerable: true,
      configurable: true,
    });
  }

  protected onCancelPress(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onCancelPress(input, event);
    this.updateInputDomain(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    Object.defineProperty(this, "needsRescale", {
      value: true,
      enumerable: true,
      configurable: true,
    });
  }

  beginCoast(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    if (this.coastCount < 2) {
      super.beginCoast(input, event);
    }
  }

  protected onBeginCoast(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onBeginCoast(input, event);
    this.updateInputDomain(input);
    this.conserveMomentum(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    Object.defineProperty(this, "needsRescale", {
      value: true,
      enumerable: true,
      configurable: true,
    });
  }

  protected onEndCoast(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onEndCoast(input, event);
    input.disableX = false;
    input.disableY = false;
    this.view!.requireUpdate(View.NeedsAnimate);
    Object.defineProperty(this, "needsRescale", {
      value: true,
      enumerable: true,
      configurable: true,
    });
  }

  protected onCoast(): void {
    super.onCoast();
    this.view!.requireUpdate(View.NeedsAnimate);
    Object.defineProperty(this, "needsRescale", {
      value: true,
      enumerable: true,
      configurable: true,
    });
  }

  protected updateInputDomain(input: ScaleGestureInput<X, Y>,
                              xScale?: ContinuousScale<X, number> | null,
                              yScale?: ContinuousScale<Y, number> | null,
                              bounds?: BoxR2): void {
    if (xScale === void 0) {
      xScale = this.xScale();
    }
    if (xScale !== null) {
      if (bounds === void 0) {
        bounds = this.view!.clientBounds;
      }
      input.xCoord = this.unscaleX(input.x0, xScale, bounds);
    }
    if (yScale === void 0) {
      yScale = this.yScale();
    }
    if (yScale !== null) {
      if (bounds === void 0) {
        bounds = this.view!.clientBounds;
      }
      input.yCoord = this.unscaleY(input.y0, yScale, bounds);
    }
  }

  neutralizeX(): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.coasting) {
        input.disableX = true;
        input.vx = 0;
        input.ax = 0;
      }
    }
  }

  neutralizeY(): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.coasting) {
        input.disableY = true;
        input.vy = 0;
        input.ay = 0;
      }
    }
  }

  protected rescale(): void {
    let input0: ScaleGestureInput<X, Y> | undefined;
    let input1: ScaleGestureInput<X, Y> | undefined;
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.pressing || input.coasting) {
        if (input0 === void 0) {
          input0 = input;
        } else if (input1 === void 0) {
          input1 = input;
        } else if (input.t0 < input0.t0) {
          input0 = input
        } else if (input.t0 < input1.t0) {
          input1 = input;
        }
      }
    }
    if (input0 !== void 0) {
      const bounds = this.view!.clientBounds;
      const xScale = this.xScale();
      const yScale = this.yScale();
      if (xScale !== null && yScale !== null) {
        if (input1 !== void 0 && this.preserveAspectRatio) {
          this.rescaleRadial(xScale, yScale, input0, input1, bounds);
        } else {
          this.rescaleXY(xScale, yScale, input0, input1, bounds);
        }
      } else if (xScale !== null) {
        this.rescaleX(xScale, input0, input1, bounds);
      } else if (yScale !== null) {
        this.rescaleY(yScale, input0, input1, bounds);
      }
    }
    Object.defineProperty(this, "needsRescale", {
      value: false,
      enumerable: true,
      configurable: true,
    });
  }

  protected rescaleRadial(oldXScale: ContinuousScale<X, number>,
                          oldYScale: ContinuousScale<Y, number>,
                          input0: ScaleGestureInput<X, Y>,
                          input1: ScaleGestureInput<X, Y>,
                          bounds: BoxR2): void {
    const x0 = input0.xCoord!;
    const y0 = input0.yCoord!;
    const px0 = this.clientToRangeX(input0.x0, oldXScale, bounds);
    const py0 = this.clientToRangeY(input0.y0, oldYScale, bounds);
    const qx0 = this.clientToRangeX(input0.x, oldXScale, bounds);
    const qy0 = this.clientToRangeY(input0.y, oldYScale, bounds);
    const vx0 = input0.vx;
    const vy0 = input0.vy;
    const ax0 = input0.ax;
    const ay0 = input0.ay;

    const x1 = input1.xCoord!;
    const y1 = input1.yCoord!;
    const px1 = this.clientToRangeX(input1.x0, oldXScale, bounds);
    const py1 = this.clientToRangeY(input1.y0, oldYScale, bounds);
    const qx1 = this.clientToRangeX(input1.x, oldXScale, bounds);
    const qy1 = this.clientToRangeY(input1.y, oldYScale, bounds);
    const vx1 = input1.vx;
    const vy1 = input1.vy;
    const ax1 = input1.ax;
    const ay1 = input1.ay;

    // Compute the difference vector between previous input positions.
    const dpx = px1 - px0;
    const dpy = py1 - py0;
    // Normalize the previous input distance vector.
    const dp = Math.max(this.distanceMin, Math.sqrt(dpx * dpx + dpy * dpy));
    const upx = dpx / dp;
    const upy = dpy / dp;

    // Compute the translation vectors from the previous input positions
    // to the current input positions.
    const dpqx0 = qx0 - px0;
    const dpqy0 = qy0 - py0;
    const dpqx1 = qx1 - px1;
    const dpqy1 = qy1 - py1;

    // Project the current input positions onto the unit vector separating
    // the previous input positions.
    const ip0 = dpqx0 * upx + dpqy0 * upy;
    const ip1 = dpqx1 * upx + dpqy1 * upy;
    const ix0 = ip0 * upx;
    const iy0 = ip0 * upy;
    const ix1 = ip1 * upx;
    const iy1 = ip1 * upy;

    // Project the current input positions onto the unit vector orthogonal
    // to the previous input positions.
    const jp0 = dpqx0 * upy + dpqy0 * -upx;
    const jp1 = dpqx1 * upy + dpqy1 * -upx;
    const jx0 = jp0 * upy;
    const jy0 = jp0 * -upx;
    const jx1 = jp1 * upy;
    const jy1 = jp1 * -upx;
    // Average the mean orthogonal projection of the input translations.
    const jpx = (jx0 + jx1) / 2;
    const jpy = (jy0 + jy1) / 2;

    // Offset the previous input positions by the radial and mean orthogonal
    // projections of the input translations.
    const rx0 = px0 + ix0 + jpx;
    const ry0 = py0 + iy0 + jpy;
    const rx1 = px1 + ix1 + jpx;
    const ry1 = py1 + iy1 + jpy;

    // Project the velocity vectors onto the unit vector separating
    // the previous input positions.
    const iv0 = vx0 * upx + vy0 * upy;
    const iv1 = vx1 * upx + vy1 * upy;
    const ivx0 = iv0 * upx;
    const ivy0 = iv0 * upy;
    const ivx1 = iv1 * upx;
    const ivy1 = iv1 * upy;

    // Project the velocity vectors onto the unit vector orthogonal
    // to the previous input positions.
    const jv0 = vx0 * upy + vy0 * -upx;
    const jv1 = vx1 * upy + vy1 * -upx;
    const jvx0 = jv0 * upy;
    const jvy0 = jv0 * -upx;
    const jvx1 = jv1 * upy;
    const jvy1 = jv1 * -upx;
    // Average the mean orthogonal projection of the input velocity.
    const jvx = (jvx0 + jvx1) / 2;
    const jvy = (jvy0 + jvy1) / 2;

    // Recombine the radial and mean orthogonal velocity components.
    let rvx0 = ivx0 + jvx;
    let rvy0 = ivy0 + jvy;
    let rvx1 = ivx1 + jvx;
    let rvy1 = ivy1 + jvy;

    // Normalize the recombined velocity vectors.
    const v0 = Math.sqrt(rvx0 * rvx0 + rvy0 * rvy0);
    const v1 = Math.sqrt(rvx1 * rvx1 + rvy1 * rvy1);
    const uvx0 = v0 !== 0 ? rvx0 / v0 : 0;
    const uvy0 = v0 !== 0 ? rvy0 / v0 : 0;
    const uvx1 = v1 !== 0 ? rvx1 / v1 : 0;
    const uvy1 = v1 !== 0 ? rvy1 / v1 : 0;

    // Scale the recombined velocity vectors back to their original magnitudes.
    rvx0 = uvx0 * v0;
    rvy0 = uvy0 * v0;
    rvx1 = uvx1 * v1;
    rvy1 = uvy1 * v1;

    // Compute the magnitudes of the acceleration vectors.
    const a0 = Math.sqrt(ax0 * ax0 + ay0 * ay0);
    const a1 = Math.sqrt(ax1 * ax1 + ay1 * ay1);

    // Rotate the acceleration vectors to opposite the updated velocity vectors.
    const rax0 = a0 * -uvx0;
    const ray0 = a0 * -uvy0;
    const rax1 = a1 * -uvx1;
    const ray1 = a1 * -uvy1;

    let newXScale: ContinuousScale<X, number> | null = null;
    const solvedXScale = oldXScale.solveDomain(x0, rx0, x1, rx1);
    if (!solvedXScale.equals(oldXScale)) {
      newXScale = solvedXScale;
      this.xScale(newXScale);
    }

    let newYScale: ContinuousScale<Y, number> | null = null;
    const solvedYScale = oldYScale.solveDomain(y0, ry0, y1, ry1);
    if (!solvedYScale.equals(oldYScale)) {
      newYScale = solvedYScale;
      this.yScale(newYScale);
    }

    if (newXScale !== null || newYScale !== null) {
      if (newXScale !== null) {
        input0.x0 = input0.x;
        input0.dx = 0;
        input0.vx = rvx0;
        input0.ax = rax0;
        input0.xCoord = this.unscaleX(input0.x0, newXScale, bounds);

        input1.x0 = input1.x;
        input1.dx = 0;
        input1.vx = rvx1;
        input1.ax = rax1;
        input1.xCoord = this.unscaleX(input1.x0, newXScale, bounds);
      }
      if (newYScale !== null) {
        input0.y0 = input0.y;
        input0.dy = 0;
        input0.vy = rvy0;
        input0.ay = ray0;
        input0.yCoord = this.unscaleY(input0.y0, newYScale, bounds);

        input1.y0 = input1.y;
        input1.dy = 0;
        input1.vy = rvy1;
        input1.ay = ray1;
        input1.yCoord = this.unscaleY(input1.y0, newYScale, bounds);
      }

      if (this.inputCount > 2) {
        const inputs = this.inputs;
        for (const inputId in inputs) {
          const input = inputs[inputId]!;
          if (input !== input0 && input !== input1) {
            if (newXScale !== null) {
              input.x0 = input.x;
              input.dx = 0;
              input.xCoord = this.unscaleX(input.x0, newXScale, bounds);
            }
            if (newYScale !== null) {
              input.y0 = input.y;
              input.dy = 0;
              input.yCoord = this.unscaleY(input.y0, newYScale, bounds);
            }
          }
        }
      }
    }
  }

  protected rescaleXY(oldXScale: ContinuousScale<X, number>,
                      oldYScale: ContinuousScale<Y, number>,
                      input0: ScaleGestureInput<X, Y>,
                      input1: ScaleGestureInput<X, Y> | undefined,
                      bounds: BoxR2): void {
    const x0 = input0.xCoord!;
    const y0 = input0.yCoord!;
    let sx0 = this.clientToRangeX(input0.x, oldXScale, bounds);
    let sy0 = this.clientToRangeY(input0.y, oldYScale, bounds);
    let disableX = input0.disableX;
    let disableY = input0.disableY;

    let x1: X | undefined;
    let y1: Y | undefined;
    let sx1: number | undefined;
    let sy1: number | undefined;

    if (input1 !== void 0) {
      x1 = input1.xCoord!;
      y1 = input1.yCoord!;
      sx1 = this.clientToRangeX(input1.x, oldXScale, bounds);
      sy1 = this.clientToRangeY(input1.y, oldYScale, bounds);
      disableX = disableX || input1.disableX;
      disableY = disableY || input1.disableY;
      const dsx = Math.abs(sx1 - sx0);
      const dsy = Math.abs(sy1 - sy0);

      const distanceMin = this.distanceMin;
      if (dsx < distanceMin) {
        const esx = (distanceMin - dsx) / 2;
        if (sx0 <= sx1) {
          sx0 -= esx;
          sx1 += esx;
        } else {
          sx0 += esx;
          sx1 -= esx;
        }
      }
      if (dsy < distanceMin) {
        const esy = (distanceMin - dsy) / 2;
        if (sy0 <= sy1) {
          sy0 -= esy;
          sy1 += esy;
        } else {
          sy0 += esy;
          sy1 -= esy;
        }
      }
    }

    let newXScale: ContinuousScale<X, number> | null = null;
    if (!disableX) {
      newXScale = oldXScale.solveDomain(x0, sx0, x1, sx1);
      if (!newXScale.equals(oldXScale)) {
        this.xScale(newXScale);
      }
    }

    let newYScale: ContinuousScale<Y, number> | null = null;
    if (!disableY) {
      newYScale = oldYScale.solveDomain(y0, sy0, y1, sy1);
      if (!newYScale.equals(oldYScale)) {
        this.yScale(newYScale);
      }
    }

    if ((newXScale !== null || newYScale !== null) && this.preserveAspectRatio) {
      const inputs = this.inputs;
      for (const inputId in inputs) {
        const input = inputs[inputId]!;
        if (newXScale !== null) {
          input.x0 = input.x;
          input.dx = 0;
          input.xCoord = this.unscaleX(input.x0, newXScale, bounds);
        }
        if (newYScale !== null) {
          input.y0 = input.y;
          input.dy = 0;
          input.yCoord = this.unscaleY(input.y0, newYScale, bounds);
        }
      }
    }
  }

  protected rescaleX(oldXScale: ContinuousScale<X, number>,
                     input0: ScaleGestureInput<X, Y>,
                     input1: ScaleGestureInput<X, Y> | undefined,
                     bounds: BoxR2): void {
    const x0 = input0.xCoord!;
    let sx0 = this.clientToRangeX(input0.x, oldXScale, bounds);
    let sx1: number | undefined;
    let x1: X | undefined;
    let disableX = input0.disableX;
    if (input1 !== void 0) {
      x1 = input1.xCoord!;
      sx1 = this.clientToRangeX(input1.x, oldXScale, bounds);
      disableX = disableX || input1.disableX;
      const dsx = Math.abs(sx1 - sx0);
      const distanceMin = this.distanceMin;
      if (dsx < distanceMin) {
        const esx = (distanceMin - dsx) / 2;
        if (sx0 <= sx1) {
          sx0 -= esx;
          sx1 += esx;
        } else {
          sx0 += esx;
          sx1 -= esx;
        }
      }
    }
    if (!disableX) {
      const newXScale = oldXScale.solveDomain(x0, sx0, x1, sx1);
      if (!newXScale.equals(oldXScale)) {
        this.xScale(newXScale);
      }
    }
  }

  protected rescaleY(oldYScale: ContinuousScale<Y, number>,
                     input0: ScaleGestureInput<X, Y>,
                     input1: ScaleGestureInput<X, Y> | undefined,
                     bounds: BoxR2): void {
    const y0 = input0.yCoord!;
    let sy0 = this.clientToRangeY(input0.y, oldYScale, bounds);
    let sy1: number | undefined;
    let y1: Y | undefined;
    let disableY = input0.disableY;
    if (input1 !== void 0) {
      y1 = input1.yCoord!;
      sy1 = this.clientToRangeY(input1.y, oldYScale, bounds);
      disableY = disableY || input1.disableY;
      const dsy = Math.abs(sy1 - sy0);
      const distanceMin = this.distanceMin;
      if (dsy < distanceMin) {
        const esy = (distanceMin - dsy) / 2;
        if (sy0 <= sy1) {
          sy0 -= esy;
          sy1 += esy;
        } else {
          sy0 += esy;
          sy1 -= esy;
        }
      }
    }
    if (!disableY) {
      const newYScale = oldYScale.solveDomain(y0, sy0, y1, sy1);
      if (!newYScale.equals(oldYScale)) {
        this.yScale(newYScale);
      }
    }
  }

  /** @hidden */
  protected conserveMomentum(input0: ScaleGestureInput<X, Y>): void {
    let input1: ScaleGestureInput<X, Y> | undefined;
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.coasting) {
        if (input1 === void 0) {
          input1 = input;
        } else if (input.t0 < input1.t0) {
          input1 = input;
        }
      }
    }
    if (input1 !== void 0) {
      const xScale = this.xScale();
      const yScale = this.yScale();
      if (xScale !== null && yScale !== null) {
        this.distributeXYMomentum(input0, input1);
      } else if (xScale !== null) {
        this.distributeXMomentum(input0, input1);
      } else if (yScale !== null) {
        this.distributeYMomentum(input0, input1);
      }
    }
  }

  /** @hidden */
  protected distributeXYMomentum(input0: ScaleGestureInput<X, Y>,
                                 input1: ScaleGestureInput<X, Y>): void {
    const vx0 = input0.vx;
    const vy0 = input0.vy;
    const vx1 = input1.vx;
    const vy1 = input1.vy;
    const v0 = Math.sqrt(vx0 * vx0 + vy0 * vy0);
    const v1 = Math.sqrt(vx1 * vx1 + vy1 * vy1);
    const uvx0 = v0 !== 0 ? vx0 / v0 : 0;
    const uvy0 = v0 !== 0 ? vy0 / v0 : 0;
    const uvx1 = v1 !== 0 ? vx1 / v1 : 0;
    const uvy1 = v1 !== 0 ? vy1 / v1 : 0;
    const v = (v0 + v1) / 2;
    input0.vx = uvx0 * v;
    input0.vy = uvy0 * v;
    input1.vx = uvx1 * v;
    input1.vy = uvy1 * v;

    const ax0 = input0.ax;
    const ay0 = input0.ay;
    const ax1 = input1.ax;
    const ay1 = input1.ay;
    const a0 = Math.sqrt(ax0 * ax0 + ay0 * ay0);
    const a1 = Math.sqrt(ax1 * ax1 + ay1 * ay1);
    const uax0 = a0 !== 0 ? ax0 / a0 : 0;
    const uay0 = a0 !== 0 ? ay0 / a0 : 0;
    const uax1 = a1 !== 0 ? ax1 / a1 : 0;
    const uay1 = a1 !== 0 ? ay1 / a1 : 0;
    const a = (a0 + a1) / 2;
    input0.ax = uax0 * a;
    input0.ay = uay0 * a;
    input1.ax = uax1 * a;
    input1.ay = uay1 * a;
  }

  /** @hidden */
  protected distributeXMomentum(input0: ScaleGestureInput<X, Y>,
                                input1: ScaleGestureInput<X, Y>): void {
    const vx0 = input0.vx;
    const vx1 = input1.vx;
    const v0 = Math.abs(vx0);
    const v1 = Math.abs(vx1);
    const uvx0 = v0 !== 0 ? vx0 / v0 : 0;
    const uvx1 = v1 !== 0 ? vx1 / v1 : 0;
    const v = (v0 + v1) / 2;
    input0.vx = uvx0 * v;
    input1.vx = uvx1 * v;

    const ax0 = input0.ax;
    const ax1 = input1.ax;
    const a0 = Math.abs(ax0);
    const a1 = Math.abs(ax1);
    const uax0 = a0 !== 0 ? ax0 / a0 : 0;
    const uax1 = a1 !== 0 ? ax1 / a1 : 0;
    const a = (a0 + a1) / 2;
    input0.ax = uax0 * a;
    input1.ax = uax1 * a;
  }

  /** @hidden */
  protected distributeYMomentum(input0: ScaleGestureInput<X, Y>,
                                input1: ScaleGestureInput<X, Y>): void {
    const vy0 = input0.vy;
    const vy1 = input1.vy;
    const v0 = Math.sqrt(vy0);
    const v1 = Math.sqrt(vy1);
    const uvy0 = v0 !== 0 ? vy0 / v0 : 0;
    const uvy1 = v1 !== 0 ? vy1 / v1 : 0;
    const v = (v0 + v1) / 2;
    input0.vy = uvy0 * v;
    input1.vy = uvy1 * v;

    const ay0 = input0.ay;
    const ay1 = input1.ay;
    const a0 = Math.sqrt(ay0);
    const a1 = Math.sqrt(ay1);
    const uay0 = a0 !== 0 ? ay0 / a0 : 0;
    const uay1 = a1 !== 0 ? ay1 / a1 : 0;
    const a = (a0 + a1) / 2;
    input0.ay = uay0 * a;
    input1.ay = uay1 * a;
  }

  /** @hidden */
  protected integrate(t: number): void {
    let coast0: ScaleGestureInput<X, Y> | undefined;
    let coast1: ScaleGestureInput<X, Y> | undefined;
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.coasting) {
        if (coast0 === void 0) {
          coast0 = input;
        } else if (coast1 === void 0) {
          coast1 = input;
          const dx0 = coast1.x - coast0.x;
          const dy0 = coast1.y - coast0.y;
          const d0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
          coast0.integrateVelocity(t);
          coast1.integrateVelocity(t);
          const dx1 = coast1.x - coast0.x;
          const dy1 = coast1.y - coast0.y;
          const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
          const s = d1 / d0;
          coast0.vx *= s;
          coast0.vy *= s;
          coast0.ax *= s;
          coast0.ay *= s;
          coast1.vx *= s;
          coast1.vy *= s;
          coast1.ax *= s;
          coast1.ay *= s;
        } else {
          input.integrateVelocity(t);
        }
      }
    }
    if (coast0 !== void 0 && coast1 === void 0) {
      coast0.integrateVelocity(t);
    }
  }

  zoom(x: number, y: number, dz: number, event: Event | null): void {
    if (dz === 0) {
      return;
    }
    const t = event !== null ? event.timeStamp : performance.now();
    const a = this.acceleration;
    let ax = a * Math.cos(Math.PI / 4);
    let ay = a * Math.sin(Math.PI / 4);
    const vMax = this.velocityMax;
    const vx = 0.5 * vMax * Math.cos(Math.PI / 4);
    const vy = 0.5 * vMax * Math.sin(Math.PI / 4);
    const dx = (4 * vx * vx) / ax;
    const dy = (4 * vy * vy) / ay;

    const inputs = this.inputs as {[inputId: string]: ScaleGestureInput<X, Y> | undefined};
    let zoom0 = inputs.zoom0;
    let zoom1 = inputs.zoom1;
    if (zoom0 !== void 0 && zoom1 !== void 0) {
      const dt = t - zoom0.t;
      if (dt > 0) {
        const dzx = Math.abs(zoom1.x - zoom0.x) / 2;
        const dzy = Math.abs(zoom1.y - zoom0.y) / 2;
        dz = Math.min(Math.max(-vMax * dt, dz), vMax * dt);
        const zx = (dz * dzx * Math.cos(Math.PI / 4)) / dx;
        const zy = (dz * dzy * Math.sin(Math.PI / 4)) / dy;
        ax = (ax * dzx) / dx;
        ay = (ay * dzy) / dy;

        zoom0.x += zx;
        zoom0.y += zy;
        zoom0.t = t;
        zoom0.dx = zx;
        zoom0.dy = zy;
        zoom0.dt = dt;
        zoom0.vx = zx / dt;
        zoom0.vy = zy / dt;
        zoom0.ax = zoom0.vx < 0 ? ax : zoom0.vx > 0 ? -ax : 0;
        zoom0.ay = zoom0.vy < 0 ? ay : zoom0.vy > 0 ? -ay : 0;

        zoom1.x -= zx;
        zoom1.y -= zy;
        zoom1.t = t;
        zoom0.dx = -zx;
        zoom0.dy = -zy;
        zoom0.dt = dt;
        zoom1.vx = -zx / dt;
        zoom1.vy = -zy / dt;
        zoom1.ax = zoom1.vx < 0 ? ax : zoom1.vx > 0 ? -ax : 0;
        zoom1.ay = zoom1.vy < 0 ? ay : zoom1.vy > 0 ? -ay : 0;
      }
    } else {
      this.interrupt(event);

      if (dz < 0) {
        zoom0 = this.createInput("zoom0", "unknown", false, x - dx, y - dy, t);
        zoom0.vx = -vx;
        zoom0.vy = -vy;
        zoom0.ax = ax;
        zoom0.ay = ay;
        zoom1 = this.createInput("zoom1", "unknown", false, x + dx, y + dy, t);
        zoom1.vx = vx;
        zoom1.vy = vy;
        zoom1.ax = -ax;
        zoom1.ay = -ay;
      } else {
        zoom0 = this.createInput("zoom0", "unknown", false, x - dx, y - dy, t);
        zoom0.vx = vx;
        zoom0.vy = vy;
        zoom0.ax = -ax;
        zoom0.ay = -ay;
        zoom1 = this.createInput("zoom1", "unknown", false, x + dx, y + dy, t);
        zoom1.vx = -vx;
        zoom1.vy = -vy;
        zoom1.ax = ax;
        zoom1.ay = ay;
      }

      inputs.zoom0 = zoom0;
      inputs.zoom1 = zoom1;
      Object.defineProperty(this, "inputCount", {
        value: this.inputCount + 2,
        enumerable: true,
        configurable: true,
      });
      this.beginCoast(zoom0, event);
      this.beginCoast(zoom1, event);
    }
  }

  /** @hidden */
  static DistanceMin: number = 10;
}

export class PointerScaleGesture<X, Y, V extends View> extends AbstractScaleGesture<X, Y, V> {
  /** @hidden */
  protected wheelZoom: boolean;

  constructor(view: V | null, delegate?: ScaleGestureDelegate<X, Y> | null) {
    super(view, delegate);
    this.onPointerEnter = this.onPointerEnter.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onPointerLeaveDocument = this.onPointerLeaveDocument.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.wheelZoom = true;
    this.initView(view);
  }

  wheel(): boolean;
  wheel(wheel: boolean): this;
  wheel(wheel?: boolean): boolean | this {
    if (wheel === void 0) {
      return this.wheelZoom;
    } else {
      if (this.wheelZoom !== wheel) {
        this.wheelZoom = wheel;
        if (this.view !== null) {
          if (wheel) {
            this.attachWheelEvents(this.view);
          } else {
            this.detachWheelEvents(this.view);
          }
        }
      }
      return this;
    }
  }

  protected attachEvents(view: V): void {
    super.attachEvents(view);
    if (this.wheelZoom) {
      this.attachWheelEvents(view);
    }
  }

  protected detachEvents(view: V): void {
    super.detachEvents(view);
    this.detachWheelEvents(view);
  }

  protected attachHoverEvents(view: V): void {
    view.on("pointerenter", this.onPointerEnter as EventListener);
    view.on("pointerleave", this.onPointerLeave as EventListener);
    view.on("pointerdown", this.onPointerDown as EventListener);
  }

  protected detachHoverEvents(view: V): void {
    view.off("pointerenter", this.onPointerEnter as EventListener);
    view.off("pointerleave", this.onPointerLeave as EventListener);
    view.off("pointerdown", this.onPointerDown as EventListener);
  }

  protected attachPressEvents(view: V): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
    document.body.addEventListener("pointerleave", this.onPointerLeaveDocument);
  }

  protected detachPressEvents(view: V): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
    document.body.removeEventListener("pointerleave", this.onPointerLeaveDocument);
  }

  protected attachWheelEvents(view: V): void {
    view.on("wheel", this.onWheel as EventListener);
  }

  protected detachWheelEvents(view: V): void {
    view.off("wheel", this.onWheel as EventListener);
  }

  protected updateInput(input: ScaleGestureInput<X, Y>, event: PointerEvent): void {
    input.target = event.target;
    input.button = event.button;
    input.buttons = event.buttons;
    input.altKey = event.altKey;
    input.ctrlKey = event.ctrlKey;
    input.metaKey = event.metaKey;
    input.shiftKey = event.shiftKey;

    input.dx = event.clientX - input.x;
    input.dy = event.clientY - input.y;
    input.dt = event.timeStamp - input.t;
    input.x = event.clientX;
    input.y = event.clientY;
    input.t = event.timeStamp;

    input.width = event.width;
    input.height = event.height;
    input.tiltX = event.tiltX;
    input.tiltY = event.tiltY;
    input.twist = event.twist;
    input.pressure = event.pressure;
    input.tangentialPressure = event.tangentialPressure;
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.buttons === 0) {
      const input = this.getOrCreateInput(event.pointerId, PointerScaleGesture.inputType(event.pointerType),
                                          event.isPrimary, event.clientX, event.clientY, event.timeStamp);
      if (!input.coasting) {
        this.updateInput(input, event);
      }
      if (!input.hovering) {
        this.beginHover(input, event);
      }
    }
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType === "mouse") {
      const input = this.getInput(event.pointerId);
      if (input !== null) {
        if (!input.coasting) {
          this.updateInput(input, event);
        }
        this.endHover(input, event);
      }
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    const input = this.getOrCreateInput(event.pointerId, PointerScaleGesture.inputType(event.pointerType),
                                        event.isPrimary, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      this.cancelPress(input, event);
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.movePress(input, event);
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.endPress(input, event);
      if (!input.defaultPrevented && event.button === 0) {
        this.press(input, event);
      }
    }
  }

  protected onPointerCancel(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
    }
  }

  protected onPointerLeaveDocument(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoom(event.clientX, event.clientY, event.deltaY, event);
  }

  /** @hidden */
  static inputType(inputType: string): GestureInputType {
    if (inputType === "mouse" || inputType === "touch" || inputType === "pen") {
      return inputType;
    } else {
      return "unknown";
    }
  }
}

export class TouchScaleGesture<X, Y, V extends View> extends AbstractScaleGesture<X, Y, V> {
  constructor(view: V | null, delegate?: ScaleGestureDelegate<X, Y> | null) {
    super(view, delegate);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchCancel = this.onTouchCancel.bind(this);
    this.initView(view);
  }

  protected attachHoverEvents(view: V): void {
    view.on("touchstart", this.onTouchStart as EventListener);
  }

  protected detachHoverEvents(view: V): void {
    view.off("touchstart", this.onTouchStart as EventListener);
  }

  protected attachPressEvents(view: V): void {
    view.on("touchmove", this.onTouchMove as EventListener);
    view.on("touchend", this.onTouchEnd as EventListener);
    view.on("touchcancel", this.onTouchCancel as EventListener);
  }

  protected detachPressEvents(view: V): void {
    view.off("touchmove", this.onTouchMove as EventListener);
    view.off("touchend", this.onTouchEnd as EventListener);
    view.off("touchcancel", this.onTouchCancel as EventListener);
  }

  protected updateInput(input: ScaleGestureInput<X, Y>, event: TouchEvent, touch: Touch): void {
    input.target = touch.target;
    input.altKey = event.altKey;
    input.ctrlKey = event.ctrlKey;
    input.metaKey = event.metaKey;
    input.shiftKey = event.shiftKey;

    input.dx = touch.clientX - input.x;
    input.dy = touch.clientY - input.y;
    input.dt = event.timeStamp - input.t;
    input.x = touch.clientX;
    input.y = touch.clientY;
    input.t = event.timeStamp;
  }

  protected onTouchStart(event: TouchEvent): void {
    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getOrCreateInput(touch.identifier, "touch", false,
                                          touch.clientX, touch.clientY, event.timeStamp);
      this.updateInput(input, event, touch);
      if (!input.pressing) {
        this.beginPress(input, event);
      }
    }
  }

  protected onTouchMove(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input !== null) {
        this.updateInput(input, event, touch);
        this.movePress(input, event);
      }
    }
  }

  protected onTouchEnd(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input !== null) {
        this.updateInput(input, event, touch);
        this.endPress(input, event);
        if (!input.defaultPrevented) {
          this.press(input, event);
        }
        this.endHover(input, event);
      }
    }
  }

  protected onTouchCancel(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input !== null) {
        this.updateInput(input, event, touch);
        this.cancelPress(input, event);
        this.endHover(input, event);
      }
    }
  }
}

export class MouseScaleGesture<X, Y, V extends View> extends AbstractScaleGesture<X, Y, V> {
  /** @hidden */
  protected wheelZoom: boolean;

  constructor(view: V | null, delegate?: ScaleGestureDelegate<X, Y> | null) {
    super(view, delegate);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeaveDocument = this.onMouseLeaveDocument.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.wheelZoom = true;
    this.initView(view);
  }

  wheel(): boolean;
  wheel(wheel: boolean): this;
  wheel(wheel?: boolean): boolean | this {
    if (wheel === void 0) {
      return this.wheelZoom;
    } else {
      if (this.wheelZoom !== wheel) {
        this.wheelZoom = wheel;
        if (this.view !== null) {
          if (wheel) {
            this.attachWheelEvents(this.view);
          } else {
            this.detachWheelEvents(this.view);
          }
        }
      }
      return this;
    }
  }

  protected attachEvents(view: V): void {
    super.attachEvents(view);
    if (this.wheelZoom) {
      this.attachWheelEvents(view);
    }
  }

  protected detachEvents(view: V): void {
    super.detachEvents(view);
    this.detachWheelEvents(view);
  }

  protected attachHoverEvents(view: V): void {
    view.on("mouseenter", this.onMouseEnter as EventListener);
    view.on("mouseleave", this.onMouseLeave as EventListener);
    view.on("mousedown", this.onMouseDown as EventListener);
  }

  protected detachHoverEvents(view: V): void {
    view.off("mouseenter", this.onMouseEnter as EventListener);
    view.off("mouseleave", this.onMouseLeave as EventListener);
    view.off("mousedown", this.onMouseDown as EventListener);
  }

  protected attachPressEvents(view: V): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mouseleave", this.onMouseLeaveDocument);
  }

  protected detachPressEvents(view: V): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mouseleave", this.onMouseLeaveDocument);
  }

  protected attachWheelEvents(view: V): void {
    view.on("wheel", this.onWheel as EventListener);
  }

  protected detachWheelEvents(view: V): void {
    view.off("wheel", this.onWheel as EventListener);
  }

  protected updateInput(input: ScaleGestureInput<X, Y>, event: MouseEvent): void {
    input.target = event.target;
    input.button = event.button;
    input.buttons = event.buttons;
    input.altKey = event.altKey;
    input.ctrlKey = event.ctrlKey;
    input.metaKey = event.metaKey;
    input.shiftKey = event.shiftKey;

    input.dx = event.clientX - input.x;
    input.dy = event.clientY - input.y;
    input.dt = event.timeStamp - input.t;
    input.x = event.clientX;
    input.y = event.clientY;
    input.t = event.timeStamp;
  }

  protected onMouseEnter(event: MouseEvent): void {
    if (event.buttons === 0) {
      const input = this.getOrCreateInput("mouse", "mouse", true,
                                          event.clientX, event.clientY, event.timeStamp);
      if (!input.coasting) {
        this.updateInput(input, event);
      }
      if (!input.hovering) {
        this.beginHover(input, event);
      }
    }
  }

  protected onMouseLeave(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      if (!input.coasting) {
        this.updateInput(input, event);
      }
      this.endHover(input, event);
    }
  }

  protected onMouseDown(event: MouseEvent): void {
    const input = this.getOrCreateInput("mouse", "mouse", true,
                                        event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.button !== 0) {
      this.cancelPress(input, event);
    }
  }

  protected onMouseMove(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.movePress(input, event);
    }
  }

  protected onMouseUp(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.endPress(input, event);
      if (!input.defaultPrevented && event.button === 0) {
        this.press(input, event);
      }
    }
  }

  protected onMouseLeaveDocument(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoom(event.clientX, event.clientY, event.deltaY, event);
  }
}

type ScaleGesture<X, Y, V extends View = View> = AbstractScaleGesture<X, Y, V>;
const ScaleGesture: typeof AbstractScaleGesture =
    typeof PointerEvent !== "undefined" ? PointerScaleGesture :
    typeof TouchEvent !== "undefined" ? TouchScaleGesture :
    MouseScaleGesture;
export {ScaleGesture};
