// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import type {TimingLike} from "@swim/util";
import type {ContinuousScale} from "@swim/util";
import type {FastenerFlags} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import type {Fastener} from "@swim/component";
import type {R2Box} from "@swim/math";
import {View} from "./View";
import type {GestureInputType} from "./Gesture";
import {GestureInput} from "./Gesture";
import {MomentumGestureInput} from "./MomentumGesture";
import type {MomentumGestureDescriptor} from "./MomentumGesture";
import type {MomentumGestureClass} from "./MomentumGesture";
import {MomentumGesture} from "./MomentumGesture";

/** @public */
export class ScaleGestureInput<X = any, Y = any> extends MomentumGestureInput {
  xCoord: X | undefined;
  yCoord: Y | undefined;
  disableX: boolean;
  disableY: boolean;

  constructor(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number) {
    super(inputId, inputType, isPrimary, x, y, t);
    this.xCoord = void 0;
    this.yCoord = void 0;
    this.disableX = false;
    this.disableY = false;
  }
}

/** @public */
export interface ScaleGestureDescriptor<R, V extends View, X, Y> extends MomentumGestureDescriptor<R, V> {
  extends?: Proto<ScaleGesture<any, any, any, any>> | boolean | null;
  preserveAspectRatio?: boolean;
  wheel?: boolean;
}

/** @public */
export interface ScaleGestureClass<G extends ScaleGesture = ScaleGesture> extends MomentumGestureClass<G> {
  /** @internal */
  readonly PreserveAspectRatioFlag: FastenerFlags;
  /** @internal */
  readonly WheelFlag: FastenerFlags;
  /** @internal */
  readonly NeedsRescale: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ScaleGesture<R = any, V extends View = View, X = any, Y = any> extends MomentumGesture<R, V> {
  /** @override */
  get descriptorType(): Proto<ScaleGestureDescriptor<R, V, X, Y>>;

  /** @internal @override */
  readonly inputs: {readonly [inputId: string]: ScaleGestureInput<X, Y> | undefined};

  /** @override */
  getInput(inputId: string | number): ScaleGestureInput<X, Y> | null;

  /** @internal @override */
  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number): ScaleGestureInput<X, Y>;

  /** @internal @override */
  getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                   x: number, y: number, t: number): ScaleGestureInput<X, Y>;

  /** @internal @override */
  clearInput(input: ScaleGestureInput<X, Y>): void;

  /** @internal @override */
  clearInputs(): void;

  /** @internal @override */
  resetInput(input: ScaleGestureInput<X, Y>): void;

  /** @protected */
  initDistanceMin(): number;

  /**
   * The minimum radial distance between input positions, in pixels.
   * Used to avoid scale gesture singularities.
   */
  distanceMin: number;

  get preserveAspectRatio(): boolean;
  set preserveAspectRatio(preserveAspectRatio: boolean);

  get wheel(): boolean;
  set wheel(wheel: boolean);

  getXScale(): ContinuousScale<X, number> | null;

  setXScale(xScale: ContinuousScale<X, number> | null, timing?: TimingLike | boolean): void;

  getYScale(): ContinuousScale<Y, number> | null;

  setYScale(yScale: ContinuousScale<Y, number> | null, timing?: TimingLike | boolean): void;

  /** @internal */
  clientToRangeX(clientX: number, xScale: ContinuousScale<X, number>, bounds: R2Box): number;

  /** @internal */
  clientToRangeY(clientY: number, yScale: ContinuousScale<Y, number>, bounds: R2Box): number;

  /** @internal */
  unscaleX(clientX: number, xScale: ContinuousScale<X, number>, bounds: R2Box): X;

  /** @internal */
  unscaleY(clientY: number, yScale: ContinuousScale<Y, number>, bounds: R2Box): Y;

  /** @internal @override */
  viewWillAnimate(view: View): void;

  /** @protected @override */
  onBeginPress(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  /** @protected @override */
  onMovePress(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  /** @protected @override */
  onEndPress(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  /** @protected @override */
  onCancelPress(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  /** @internal @override */
  beginCoast(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  /** @protected @override */
  onBeginCoast(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  /** @protected @override */
  onEndCoast(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  /** @protected @override */
  onCoast(): void;

  /** @internal */
  updateInputDomain(input: ScaleGestureInput<X, Y>,
                    xScale?: ContinuousScale<X, number> | null,
                    yScale?: ContinuousScale<Y, number> | null,
                    bounds?: R2Box): void;

  /** @internal */
  neutralizeX(): void;

  /** @internal */
  neutralizeY(): void;

  /** @internal */
  rescale(): void;

  /** @internal */
  rescaleRadial(oldXScale: ContinuousScale<X, number>,
                oldYScale: ContinuousScale<Y, number>,
                input0: ScaleGestureInput<X, Y>,
                input1: ScaleGestureInput<X, Y>,
                bounds: R2Box): void;

  /** @internal */
  rescaleXY(oldXScale: ContinuousScale<X, number>,
            oldYScale: ContinuousScale<Y, number>,
            input0: ScaleGestureInput<X, Y>,
            input1: ScaleGestureInput<X, Y> | undefined,
            bounds: R2Box): void;

  /** @internal */
  rescaleX(oldXScale: ContinuousScale<X, number>,
           input0: ScaleGestureInput<X, Y>,
           input1: ScaleGestureInput<X, Y> | undefined,
           bounds: R2Box): void;

  /** @internal */
  rescaleY(oldYScale: ContinuousScale<Y, number>,
           input0: ScaleGestureInput<X, Y>,
           input1: ScaleGestureInput<X, Y> | undefined,
           bounds: R2Box): void;

  /** @internal */
  conserveMomentum(input0: ScaleGestureInput<X, Y>): void;

  /** @internal */
  distributeXYMomentum(input0: ScaleGestureInput<X, Y>,
                       input1: ScaleGestureInput<X, Y>): void;

  /** @internal */
  distributeXMomentum(input0: ScaleGestureInput<X, Y>,
                      input1: ScaleGestureInput<X, Y>): void;

  /** @internal */
  distributeYMomentum(input0: ScaleGestureInput<X, Y>,
                      input1: ScaleGestureInput<X, Y>): void;

  /** @internal @override */
  integrate(t: number): void;

  /** @internal */
  zoom(x: number, y: number, dz: number, event: Event | null): void;
}

/** @public */
export const ScaleGesture = (<R, V extends View, X, Y, G extends ScaleGesture<any, any, any, any>>() => MomentumGesture.extend<ScaleGesture<R, V, X, Y>, ScaleGestureClass<G>>("ScaleGesture", {
  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
                                                       x: number, y: number, t: number): ScaleGestureInput<X, Y> {
    return new ScaleGestureInput(inputId, inputType, isPrimary, x, y, t);
  },

  clearInputs(): void {
    super.clearInputs();
    this.setFlags(this.flags & ~ScaleGesture.NeedsRescale);
  },

  distanceMin: 10,

  initDistanceMin(): number {
    return (Object.getPrototypeOf(this) as ScaleGesture).distanceMin;
  },

  get preserveAspectRatio(): boolean {
    return (this.flags & ScaleGesture.PreserveAspectRatioFlag) !== 0;
  },

  set preserveAspectRatio(preserveAspectRatio: boolean) {
    if (preserveAspectRatio) {
      this.setFlags(this.flags | ScaleGesture.PreserveAspectRatioFlag);
    } else {
      this.setFlags(this.flags & ~ScaleGesture.PreserveAspectRatioFlag);
    }
  },

  get wheel(): boolean {
    return (this.flags & ScaleGesture.WheelFlag) !== 0;
  },

  set wheel(wheel: boolean) {
    if (wheel) {
      this.setFlags(this.flags | ScaleGesture.WheelFlag);
    } else {
      this.setFlags(this.flags & ~ScaleGesture.WheelFlag);
    }
  },

  getXScale(): ContinuousScale<X, number> | null {
    return null; // hook
  },

  setXScale(xScale: ContinuousScale<X, number> | null, timing?: TimingLike | boolean): void {
    // hook
  },

  getYScale(): ContinuousScale<Y, number> | null {
    return null; // hook
  },

  setYScale(yScale: ContinuousScale<Y, number> | null, timing?: TimingLike | boolean): void {
    // hook
  },

  clientToRangeX(clientX: number, xScale: ContinuousScale<X, number>, bounds: R2Box): number {
    const viewX = clientX - bounds.xMin;
    const xRange = xScale.range;
    if (xRange[0] <= xRange[1]) {
      return xRange[0] + viewX;
    }
    return bounds.xMax + viewX - xRange[0];
  },

  clientToRangeY(clientY: number, yScale: ContinuousScale<Y, number>, bounds: R2Box): number {
    const viewY = clientY - bounds.yMin;
    const yRange = yScale.range;
    if (yRange[0] <= yRange[1]) {
      return yRange[0] + viewY;
    }
    return bounds.yMax + viewY - yRange[0];
  },

  unscaleX(clientX: number, xScale: ContinuousScale<X, number>, bounds: R2Box): X {
    return xScale.inverse(this.clientToRangeX(clientX, xScale, bounds));
  },

  unscaleY(clientY: number, yScale: ContinuousScale<Y, number>, bounds: R2Box): Y {
    return yScale.inverse(this.clientToRangeY(clientY, yScale, bounds));
  },

  viewWillAnimate(view: View): void {
    super.viewWillAnimate(view);
    if ((this.flags & ScaleGesture.NeedsRescale) !== 0) {
      this.rescale();
    }
  },

  onBeginPress(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onBeginPress(input, event);
    this.updateInputDomain(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  },

  onMovePress(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onMovePress(input, event);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  },

  onEndPress(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onEndPress(input, event);
    this.updateInputDomain(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  },

  onCancelPress(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onCancelPress(input, event);
    this.updateInputDomain(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  },

  beginCoast(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    if (this.coastCount < 2) {
      super.beginCoast(input, event);
    }
  },

  onBeginCoast(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onBeginCoast(input, event);
    this.updateInputDomain(input);
    this.conserveMomentum(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  },

  onEndCoast(input: ScaleGestureInput<X, Y>, event: Event | null): void {
    super.onEndCoast(input, event);
    input.disableX = false;
    input.disableY = false;
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  },

  onCoast(): void {
    super.onCoast();
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  },

  updateInputDomain(input: ScaleGestureInput<X, Y>, xScale?: ContinuousScale<X, number> | null,
                    yScale?: ContinuousScale<Y, number> | null, bounds?: R2Box): void {
    if (xScale === void 0) {
      xScale = this.getXScale();
    }
    if (xScale !== null) {
      if (bounds === void 0) {
        bounds = this.view!.clientBounds;
      }
      input.xCoord = this.unscaleX(input.x0, xScale, bounds);
    }
    if (yScale === void 0) {
      yScale = this.getYScale();
    }
    if (yScale !== null) {
      if (bounds === void 0) {
        bounds = this.view!.clientBounds;
      }
      input.yCoord = this.unscaleY(input.y0, yScale, bounds);
    }
  },

  neutralizeX(): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (!input.coasting) {
        continue;
      }
      input.disableX = true;
      input.vx = 0;
      input.ax = 0;
    }
  },

  neutralizeY(): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (!input.coasting) {
        continue;
      }
      input.disableY = true;
      input.vy = 0;
      input.ay = 0;
    }
  },

  rescale(): void {
    let input0: ScaleGestureInput<X, Y> | undefined;
    let input1: ScaleGestureInput<X, Y> | undefined;
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (!input.pressing && !input.coasting) {
        continue;
      } else if (input0 === void 0) {
        input0 = input;
      } else if (input1 === void 0) {
        input1 = input;
      } else if (input.t0 < input0.t0) {
        input0 = input;
      } else if (input.t0 < input1.t0) {
        input1 = input;
      }
    }
    if (input0 !== void 0) {
      const bounds = this.view!.clientBounds;
      const xScale = this.getXScale();
      const yScale = this.getYScale();
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
    this.setFlags(this.flags & ~ScaleGesture.NeedsRescale);
  },

  rescaleRadial(oldXScale: ContinuousScale<X, number>, oldYScale: ContinuousScale<Y, number>,
                input0: ScaleGestureInput<X, Y>, input1: ScaleGestureInput<X, Y>, bounds: R2Box): void {
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
      this.setXScale(newXScale);
    }

    let newYScale: ContinuousScale<Y, number> | null = null;
    const solvedYScale = oldYScale.solveDomain(y0, ry0, y1, ry1);
    if (!solvedYScale.equals(oldYScale)) {
      newYScale = solvedYScale;
      this.setYScale(newYScale);
    }

    if (newXScale === null && newYScale === null) {
      return;
    }
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

    if (this.inputCount <= 2) {
      return;
    }
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input === input0 || input === input1) {
        continue;
      }
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
  },

  rescaleXY(oldXScale: ContinuousScale<X, number>, oldYScale: ContinuousScale<Y, number>,
            input0: ScaleGestureInput<X, Y>, input1: ScaleGestureInput<X, Y> | undefined, bounds: R2Box): void {
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
        this.setXScale(newXScale);
      }
    }

    let newYScale: ContinuousScale<Y, number> | null = null;
    if (!disableY) {
      newYScale = oldYScale.solveDomain(y0, sy0, y1, sy1);
      if (!newYScale.equals(oldYScale)) {
        this.setYScale(newYScale);
      }
    }

    if ((newXScale === null && newYScale === null) || !this.preserveAspectRatio) {
      return;
    }
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
  },

  rescaleX(oldXScale: ContinuousScale<X, number>, input0: ScaleGestureInput<X, Y>,
           input1: ScaleGestureInput<X, Y> | undefined, bounds: R2Box): void {
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
    if (disableX) {
      return;
    }
    const newXScale = oldXScale.solveDomain(x0, sx0, x1, sx1);
    if (!newXScale.equals(oldXScale)) {
      this.setXScale(newXScale);
    }
  },

  rescaleY(oldYScale: ContinuousScale<Y, number>, input0: ScaleGestureInput<X, Y>,
           input1: ScaleGestureInput<X, Y> | undefined, bounds: R2Box): void {
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
    if (disableY) {
      return;
    }
    const newYScale = oldYScale.solveDomain(y0, sy0, y1, sy1);
    if (!newYScale.equals(oldYScale)) {
      this.setYScale(newYScale);
    }
  },

  conserveMomentum(input0: ScaleGestureInput<X, Y>): void {
    let input1: ScaleGestureInput<X, Y> | undefined;
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (!input.coasting) {
        continue;
      } else if (input1 === void 0) {
        input1 = input;
      } else if (input.t0 < input1.t0) {
        input1 = input;
      }
    }
    if (input1 === void 0) {
      return;
    }
    const xScale = this.getXScale();
    const yScale = this.getYScale();
    if (xScale !== null && yScale !== null) {
      this.distributeXYMomentum(input0, input1);
    } else if (xScale !== null) {
      this.distributeXMomentum(input0, input1);
    } else if (yScale !== null) {
      this.distributeYMomentum(input0, input1);
    }
  },

  distributeXYMomentum(input0: ScaleGestureInput<X, Y>, input1: ScaleGestureInput<X, Y>): void {
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
  },

  distributeXMomentum(input0: ScaleGestureInput<X, Y>, input1: ScaleGestureInput<X, Y>): void {
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
  },

  distributeYMomentum(input0: ScaleGestureInput<X, Y>, input1: ScaleGestureInput<X, Y>): void {
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
  },

  integrate(t: number): void {
    let coast0: ScaleGestureInput<X, Y> | undefined;
    let coast1: ScaleGestureInput<X, Y> | undefined;
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (!input.coasting) {
        continue;
      } else if (coast0 === void 0) {
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
    if (coast0 !== void 0 && coast1 === void 0) {
      coast0.integrateVelocity(t);
    }
  },

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
      (this as Mutable<typeof this>).inputCount += 2;
      this.beginCoast(zoom0, event);
      this.beginCoast(zoom1, event);
    }
  },
},
{
  construct(gesture: G | null, owner: G extends Fastener<infer R, any, any> ? R : never): G {
    gesture = super.construct(gesture, owner) as G;
    gesture.distanceMin = gesture.initDistanceMin();
    return gesture;
  },

  specialize(template: G extends {readonly descriptorType?: Proto<infer D>} ? D : never): FastenerClass<G> {
    let superClass = template.extends as FastenerClass<G> | null | undefined;
    if (superClass === void 0 || superClass === null) {
      const method = template.method;
      if (method === "pointer") {
        superClass = PointerScaleGesture as unknown as FastenerClass<G>;
      } else if (method === "touch") {
        superClass = TouchScaleGesture as unknown as FastenerClass<G>;
      } else if (method === "mouse") {
        superClass = MouseScaleGesture as unknown as FastenerClass<G>;
      } else if (typeof PointerEvent !== "undefined") {
        superClass = PointerScaleGesture as unknown as FastenerClass<G>;
      } else if (typeof TouchEvent !== "undefined") {
        superClass = TouchScaleGesture as unknown as FastenerClass<G>;
      } else {
        superClass = MouseScaleGesture as unknown as FastenerClass<G>;
      }
    }
    return superClass;
  },

  refine(gestureClass: FastenerClass<ScaleGesture<any, any, any, any>>): void {
    super.refine(gestureClass);
    const fastenerPrototype = gestureClass.prototype;

    let flagsInit = fastenerPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "preserveAspectRatio")) {
      if (fastenerPrototype.preserveAspectRatio) {
        flagsInit |= ScaleGesture.PreserveAspectRatioFlag;
      } else {
        flagsInit &= ~ScaleGesture.PreserveAspectRatioFlag;
      }
      delete (fastenerPrototype as ScaleGestureDescriptor<any, any, any, any>).preserveAspectRatio;
    }
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "wheel")) {
      if (fastenerPrototype.wheel) {
        flagsInit |= ScaleGesture.WheelFlag;
      } else {
        flagsInit &= ~ScaleGesture.WheelFlag;
      }
      delete (fastenerPrototype as ScaleGestureDescriptor<any, any, any, any>).wheel;
    }
    Object.defineProperty(fastenerPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });
  },

  PreserveAspectRatioFlag: 1 << (MomentumGesture.FlagShift + 0),
  WheelFlag: 1 << (MomentumGesture.FlagShift + 1),
  NeedsRescale: 1 << (MomentumGesture.FlagShift + 2),

  FlagShift: MomentumGesture.FlagShift + 3,
  FlagMask: (1 << (MomentumGesture.FlagShift + 3)) - 1,
}))();

/** @internal */
export interface PointerScaleGesture<R = any, V extends View = View, X = any, Y = any> extends ScaleGesture<R, V, X, Y> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: ScaleGestureInput<X, Y>, event: PointerEvent): void;

  /** @internal @protected */
  onPointerEnter(event: PointerEvent): void;

  /** @internal @protected */
  onPointerLeave(event: PointerEvent): void;

  /** @internal @protected */
  onPointerDown(event: PointerEvent): void;

  /** @internal @protected */
  onPointerMove(event: PointerEvent): void;

  /** @internal @protected */
  onPointerUp(event: PointerEvent): void;

  /** @internal @protected */
  onPointerCancel(event: PointerEvent): void;

  /** @internal @protected */
  onPointerLeaveDocument(event: PointerEvent): void;

  /** @internal @protected */
  onWheel(event: WheelEvent): void;
}

/** @internal */
export const PointerScaleGesture = (<R, V extends View, X, Y, G extends PointerScaleGesture<any, any, any, any>>() => ScaleGesture.extend<PointerScaleGesture<R, V, X, Y>, ScaleGestureClass<G>>("PointerScaleGesture", {
  wheel: true,

  attachHoverEvents(view: V): void {
    view.addEventListener("pointerenter", this.onPointerEnter as EventListener);
    view.addEventListener("pointerleave", this.onPointerLeave as EventListener);
    view.addEventListener("pointerdown", this.onPointerDown as EventListener);
    view.addEventListener("wheel", this.onWheel as EventListener);
  },

  detachHoverEvents(view: V): void {
    view.removeEventListener("pointerenter", this.onPointerEnter as EventListener);
    view.removeEventListener("pointerleave", this.onPointerLeave as EventListener);
    view.removeEventListener("pointerdown", this.onPointerDown as EventListener);
    view.removeEventListener("wheel", this.onWheel as EventListener);
  },

  attachPressEvents(view: V): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
    document.body.addEventListener("pointerleave", this.onPointerLeaveDocument);
  },

  detachPressEvents(view: V): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
    document.body.removeEventListener("pointerleave", this.onPointerLeaveDocument);
  },

  updateInput(input: ScaleGestureInput<X, Y>, event: PointerEvent): void {
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
  },

  onPointerEnter(event: PointerEvent): void {
    if (event.pointerType !== "mouse" || event.buttons !== 0) {
      return;
    }
    const input = this.getOrCreateInput(event.pointerId, GestureInput.pointerInputType(event.pointerType),
                                        event.isPrimary, event.clientX, event.clientY, event.timeStamp);
    if (!input.coasting) {
      this.updateInput(input, event);
    }
    if (!input.hovering) {
      this.beginHover(input, event);
    }
  },

  onPointerLeave(event: PointerEvent): void {
    if (event.pointerType !== "mouse") {
      return;
    }
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    } else if (!input.coasting) {
      this.updateInput(input, event);
    }
    this.endHover(input, event);
  },

  onPointerDown(event: PointerEvent): void {
    const input = this.getOrCreateInput(event.pointerId, GestureInput.pointerInputType(event.pointerType),
                                        event.isPrimary, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      this.cancelPress(input, event);
    }
  },

  onPointerMove(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.movePress(input, event);
  },

  onPointerUp(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.endPress(input, event);
    if (!input.defaultPrevented && event.button === 0) {
      this.press(input, event);
    }
  },

  onPointerCancel(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.cancelPress(input, event);
  },

  onPointerLeaveDocument(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.cancelPress(input, event);
    this.endHover(input, event);
  },

  onWheel(event: WheelEvent): void {
    if (!this.wheel) {
      return;
    }
    event.preventDefault();
    this.zoom(event.clientX, event.clientY, event.deltaY, event);
  },
},
{
  construct(gesture: G | null, owner: G extends Fastener<infer R, any, any> ? R : never): G {
    gesture = super.construct(gesture, owner) as G;
    gesture.onPointerEnter = gesture.onPointerEnter.bind(gesture);
    gesture.onPointerLeave = gesture.onPointerLeave.bind(gesture);
    gesture.onPointerDown = gesture.onPointerDown.bind(gesture);
    gesture.onPointerMove = gesture.onPointerMove.bind(gesture);
    gesture.onPointerUp = gesture.onPointerUp.bind(gesture);
    gesture.onPointerCancel = gesture.onPointerCancel.bind(gesture);
    gesture.onPointerLeaveDocument = gesture.onPointerLeaveDocument.bind(gesture);
    gesture.onWheel = gesture.onWheel.bind(gesture);
    return gesture;
  },
}))();

/** @internal */
export interface TouchScaleGesture<R = any, V extends View = View, X = any, Y = any> extends ScaleGesture<R, V, X, Y> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: ScaleGestureInput<X, Y>, event: TouchEvent, touch: Touch): void;

  /** @internal @protected */
  onTouchStart(event: TouchEvent): void;

  /** @internal @protected */
  onTouchMove(event: TouchEvent): void;

  /** @internal @protected */
  onTouchEnd(event: TouchEvent): void;

  /** @internal @protected */
  onTouchCancel(event: TouchEvent): void;
}

/** @internal */
export const TouchScaleGesture = (<R, V extends View, X, Y, G extends TouchScaleGesture<any, any, any, any>>() => ScaleGesture.extend<TouchScaleGesture<R, V, X, Y>, ScaleGestureClass<G>>("TouchScaleGesture", {
  attachHoverEvents(view: V): void {
    view.addEventListener("touchstart", this.onTouchStart as EventListener);
  },

  detachHoverEvents(view: V): void {
    view.removeEventListener("touchstart", this.onTouchStart as EventListener);
  },

  attachPressEvents(view: V): void {
    view.addEventListener("touchmove", this.onTouchMove as EventListener);
    view.addEventListener("touchend", this.onTouchEnd as EventListener);
    view.addEventListener("touchcancel", this.onTouchCancel as EventListener);
  },

  detachPressEvents(view: V): void {
    view.removeEventListener("touchmove", this.onTouchMove as EventListener);
    view.removeEventListener("touchend", this.onTouchEnd as EventListener);
    view.removeEventListener("touchcancel", this.onTouchCancel as EventListener);
  },

  updateInput(input: ScaleGestureInput<X, Y>, event: TouchEvent, touch: Touch): void {
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
  },

  onTouchStart(event: TouchEvent): void {
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
  },

  onTouchMove(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input === null) {
        continue;
      }
      this.updateInput(input, event, touch);
      this.movePress(input, event);
    }
  },

  onTouchEnd(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input === null) {
        continue;
      }
      this.updateInput(input, event, touch);
      this.endPress(input, event);
      if (!input.defaultPrevented) {
        this.press(input, event);
      }
      this.endHover(input, event);
    }
  },

  onTouchCancel(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input === null) {
        continue;
      }
      this.updateInput(input, event, touch);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  },
},
{
  construct(gesture: G | null, owner: G extends Fastener<infer R, any, any> ? R : never): G {
    gesture = super.construct(gesture, owner) as G;
    gesture.onTouchStart = gesture.onTouchStart.bind(gesture);
    gesture.onTouchMove = gesture.onTouchMove.bind(gesture);
    gesture.onTouchEnd = gesture.onTouchEnd.bind(gesture);
    gesture.onTouchCancel = gesture.onTouchCancel.bind(gesture);
    return gesture;
  },
}))();

/** @internal */
export interface MouseScaleGesture<R = any, V extends View = View, X = any, Y = any> extends ScaleGesture<R, V, X, Y> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: ScaleGestureInput<X, Y>, event: MouseEvent): void;

  /** @internal @protected */
  onMouseEnter(event: MouseEvent): void;

  /** @internal @protected */
  onMouseLeave(event: MouseEvent): void;

  /** @internal @protected */
  onMouseDown(event: MouseEvent): void;

  /** @internal @protected */
  onMouseMove(event: MouseEvent): void;

  /** @internal @protected */
  onMouseUp(event: MouseEvent): void;

  /** @internal @protected */
  onMouseLeaveDocument(event: MouseEvent): void;

  /** @internal @protected */
  onWheel(event: WheelEvent): void;
}

/** @internal */
export const MouseScaleGesture = (<R, V extends View, X, Y, G extends MouseScaleGesture<any, any, any, any>>() => ScaleGesture.extend<MouseScaleGesture<R, V, X, Y>, ScaleGestureClass<G>>("MouseScaleGesture", {
  wheel: true,

  attachHoverEvents(view: V): void {
    view.addEventListener("mouseenter", this.onMouseEnter as EventListener);
    view.addEventListener("mouseleave", this.onMouseLeave as EventListener);
    view.addEventListener("mousedown", this.onMouseDown as EventListener);
    view.addEventListener("wheel", this.onWheel as EventListener);
  },

  detachHoverEvents(view: V): void {
    view.removeEventListener("mouseenter", this.onMouseEnter as EventListener);
    view.removeEventListener("mouseleave", this.onMouseLeave as EventListener);
    view.removeEventListener("mousedown", this.onMouseDown as EventListener);
    view.removeEventListener("wheel", this.onWheel as EventListener);
  },

  attachPressEvents(view: V): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mouseleave", this.onMouseLeaveDocument);
  },

  detachPressEvents(view: V): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mouseleave", this.onMouseLeaveDocument);
  },

  updateInput(input: ScaleGestureInput<X, Y>, event: MouseEvent): void {
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
  },

  onMouseEnter(event: MouseEvent): void {
    if (event.buttons !== 0) {
      return;
    }
    const input = this.getOrCreateInput("mouse", "mouse", true,
                                        event.clientX, event.clientY, event.timeStamp);
    if (!input.coasting) {
      this.updateInput(input, event);
    }
    if (!input.hovering) {
      this.beginHover(input, event);
    }
  },

  onMouseLeave(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input === null) {
      return;
    } else if (!input.coasting) {
      this.updateInput(input, event);
    }
    this.endHover(input, event);
  },

  onMouseDown(event: MouseEvent): void {
    const input = this.getOrCreateInput("mouse", "mouse", true,
                                        event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.button !== 0) {
      this.cancelPress(input, event);
    }
  },

  onMouseMove(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.movePress(input, event);
  },

  onMouseUp(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.endPress(input, event);
    if (!input.defaultPrevented && event.button === 0) {
      this.press(input, event);
    }
  },

  onMouseLeaveDocument(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.cancelPress(input, event);
    this.endHover(input, event);
  },

  onWheel(event: WheelEvent): void {
    if (!this.wheel) {
      return;
    }
    event.preventDefault();
    this.zoom(event.clientX, event.clientY, event.deltaY, event);
  },
},
{
  construct(gesture: G | null, owner: G extends Fastener<infer R, any, any> ? R : never): G {
    gesture = super.construct(gesture, owner) as G;
    gesture.onMouseEnter = gesture.onMouseEnter.bind(gesture);
    gesture.onMouseLeave = gesture.onMouseLeave.bind(gesture);
    gesture.onMouseDown = gesture.onMouseDown.bind(gesture);
    gesture.onMouseMove = gesture.onMouseMove.bind(gesture);
    gesture.onMouseUp = gesture.onMouseUp.bind(gesture);
    gesture.onMouseLeaveDocument = gesture.onMouseLeaveDocument.bind(gesture);
    gesture.onWheel = gesture.onWheel.bind(gesture);
    return gesture;
  },
}))();
