// Copyright 2015-2022 Swim.inc
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

import type {Mutable, ObserverType, AnyTiming, ContinuousScale} from "@swim/util";
import type {FastenerOwner, FastenerFlags} from "@swim/component";
import type {R2Box} from "@swim/math";
import type {GestureInputType} from "./GestureInput";
import type {GestureMethod} from "./Gesture";
import {MomentumGestureInit, MomentumGestureClass, MomentumGesture} from "./MomentumGesture";
import {ScaleGestureInput} from "./ScaleGestureInput";
import {MouseScaleGesture} from "./"; // forward import
import {TouchScaleGesture} from "./"; // forward import
import {PointerScaleGesture} from "./"; // forward import
import type {ViewContext} from "../view/ViewContext";
import {View} from "../"; // forward import

/** @public */
export interface ScaleGestureInit<V extends View = View, X = unknown, Y = unknown> extends MomentumGestureInit<V> {
  extends?: {prototype: ScaleGesture<any, any, any, any>} | string | boolean | null;

  /**
   * The minimum radial distance between input positions, in pixels.
   * Used to avoid scale gesture singularities.
   */
  distanceMin?: number;

  preserveAspectRatio?: boolean;

  wheel?: boolean;

  getXScale?(): ContinuousScale<X, number> | null;

  setXScale?(xScale: ContinuousScale<X, number> | null, timing?: AnyTiming | boolean): void;

  getYScale?(): ContinuousScale<Y, number> | null;

  setYScale?(yScale: ContinuousScale<Y, number> | null, timing?: AnyTiming | boolean): void;

  willBeginHover?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didBeginHover?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willEndHover?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didEndHover?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willBeginPress?(input: ScaleGestureInput<X, Y>, event: Event | null): boolean | void;

  didBeginPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willMovePress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didMovePress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willEndPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didEndPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willCancelPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didCancelPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willLongPress?(input: ScaleGestureInput<X, Y>): void;

  didLongPress?(input: ScaleGestureInput<X, Y>): void;

  willBeginCoast?(input: ScaleGestureInput<X, Y>, event: Event | null): boolean | void;

  didBeginCoast?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willEndCoast?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didEndCoast?(input: ScaleGestureInput<X, Y>, event: Event | null): void;
}

/** @public */
export type ScaleGestureDescriptor<O = unknown, V extends View = View, X = unknown, Y = unknown, I = {}> = ThisType<ScaleGesture<O, V, X, Y> & I> & ScaleGestureInit<V, X, Y> & Partial<I>;

/** @public */
export interface ScaleGestureClass<G extends ScaleGesture<any, any, any, any> = ScaleGesture<any, any, any, any>> extends MomentumGestureClass<G> {
  /** @internal */
  readonly DistanceMin: number;

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
export interface ScaleGestureFactory<G extends ScaleGesture<any, any, any, any> = ScaleGesture<any, any, any, any>> extends ScaleGestureClass<G> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ScaleGestureFactory<G> & I;

  specialize(method: GestureMethod): ScaleGestureFactory | null;

  define<O, V extends View = View, X = unknown, Y = unknown>(className: string, descriptor: ScaleGestureDescriptor<O, V, X, Y>): ScaleGestureFactory<ScaleGesture<any, V, X, Y>>;
  define<O, V extends View = View, X = unknown, Y = unknown>(className: string, descriptor: {observes: boolean} & ScaleGestureDescriptor<O, V, X, Y, ObserverType<V>>): ScaleGestureFactory<ScaleGesture<any, V, X, Y>>;
  define<O, V extends View = View, X = unknown, Y = unknown, I = {}>(className: string, descriptor: {implements: unknown} & ScaleGestureDescriptor<O, V, X, Y, I>): ScaleGestureFactory<ScaleGesture<any, V, X, Y> & I>;
  define<O, V extends View = View, X = unknown, Y = unknown, I = {}>(className: string, descriptor: {implements: boolean; observes: boolean} & ScaleGestureDescriptor<O, V, X, Y, I & ObserverType<V>>): ScaleGestureFactory<ScaleGesture<any, V, X, Y> & I>;

  <O, V extends View = View, X = unknown, Y = unknown>(descriptor: ScaleGestureDescriptor<O, V, X, Y>): PropertyDecorator;
  <O, V extends View = View, X = unknown, Y = unknown>(descriptor: {observes: boolean} & ScaleGestureDescriptor<O, V, X, Y, ObserverType<V>>): PropertyDecorator;
  <O, V extends View = View, X = unknown, Y = unknown, I = {}>(descriptor: {implements: unknown} & ScaleGestureDescriptor<O, V, X, Y, I>): PropertyDecorator;
  <O, V extends View = View, X = unknown, Y = unknown, I = {}>(descriptor: {implements: boolean; observes: boolean} & ScaleGestureDescriptor<O, V, X, Y, I & ObserverType<V>>): PropertyDecorator;
}

/** @public */
export interface ScaleGesture<O = unknown, V extends View = View, X = unknown, Y = unknown> extends MomentumGesture<O, V> {
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

  distanceMin: number;

  get preserveAspectRatio(): boolean;
  set preserveAspectRatio(preserveAspectRatio: boolean);

  get wheel(): boolean;
  set wheel(wheel: boolean);

  getXScale(): ContinuousScale<X, number> | null;

  setXScale(xScale: ContinuousScale<X, number> | null, timing?: AnyTiming | boolean): void;

  getYScale(): ContinuousScale<Y, number> | null;

  setYScale(yScale: ContinuousScale<Y, number> | null, timing?: AnyTiming | boolean): void;

  /** @internal */
  clientToRangeX(clientX: number, xScale: ContinuousScale<X, number>, bounds: R2Box): number;

  /** @internal */
  clientToRangeY(clientY: number, yScale: ContinuousScale<Y, number>, bounds: R2Box): number;

  /** @internal */
  unscaleX(clientX: number, xScale: ContinuousScale<X, number>, bounds: R2Box): X;

  /** @internal */
  unscaleY(clientY: number, yScale: ContinuousScale<Y, number>, bounds: R2Box): Y;

  /** @internal @override */
  viewWillAnimate(viewContext: ViewContext): void;

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

  /** @internal @override */
  get observes(): boolean;
}

/** @public */
export const ScaleGesture = (function (_super: typeof MomentumGesture) {
  const ScaleGesture: ScaleGestureFactory = _super.extend("ScaleGesture");

  ScaleGesture.prototype.createInput = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, inputId: string, inputType: GestureInputType, isPrimary: boolean,
                                                       x: number, y: number, t: number): ScaleGestureInput<X, Y> {
    return new ScaleGestureInput(inputId, inputType, isPrimary, x, y, t);
  };

  ScaleGesture.prototype.clearInputs = function (this: ScaleGesture): void {
    MomentumGesture.prototype.clearInputs.call(this);
    this.setFlags(this.flags & ~ScaleGesture.NeedsRescale);
  };

  Object.defineProperty(ScaleGesture.prototype, "preserveAspectRatio", {
    get(this: ScaleGesture): boolean {
      return (this.flags & ScaleGesture.PreserveAspectRatioFlag) !== 0;
    },
    set(this: ScaleGesture, preserveAspectRatio: boolean): void {
      if (preserveAspectRatio) {
        this.setFlags(this.flags | ScaleGesture.PreserveAspectRatioFlag);
      } else {
        this.setFlags(this.flags & ~ScaleGesture.PreserveAspectRatioFlag);
      }
    },
    configurable: true,
  });

  Object.defineProperty(ScaleGesture.prototype, "wheel", {
    get(this: ScaleGesture): boolean {
      return (this.flags & ScaleGesture.WheelFlag) !== 0;
    },
    set(this: ScaleGesture, wheel: boolean): void {
      if (wheel) {
        this.setFlags(this.flags | ScaleGesture.WheelFlag);
      } else {
        this.setFlags(this.flags & ~ScaleGesture.WheelFlag);
      }
    },
    configurable: true,
  });

  ScaleGesture.prototype.getXScale = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>): ContinuousScale<X, number> | null {
    return null; // hook
  };

  ScaleGesture.prototype.setXScale = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, xScale: ContinuousScale<X, number> | null, timing?: AnyTiming | boolean): void {
    // hook
  };

  ScaleGesture.prototype.getYScale = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>): ContinuousScale<Y, number> | null {
    return null; // hook
  };

  ScaleGesture.prototype.setYScale = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, yScale: ContinuousScale<Y, number> | null, timing?: AnyTiming | boolean): void {
    // hook
  };

  ScaleGesture.prototype.clientToRangeX = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, clientX: number, xScale: ContinuousScale<X, number>, bounds: R2Box): number {
    const viewX = clientX - bounds.xMin;
    const xRange = xScale.range;
    if (xRange[0] <= xRange[1]) {
      return xRange[0] + viewX;
    } else {
      return bounds.xMax + viewX - xRange[0];
    }
  };

  ScaleGesture.prototype.clientToRangeY = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, clientY: number, yScale: ContinuousScale<Y, number>, bounds: R2Box): number {
    const viewY = clientY - bounds.yMin;
    const yRange = yScale.range;
    if (yRange[0] <= yRange[1]) {
      return yRange[0] + viewY;
    } else {
      return bounds.yMax + viewY - yRange[0];
    }
  };

  ScaleGesture.prototype.unscaleX = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, clientX: number, xScale: ContinuousScale<X, number>, bounds: R2Box): X {
    return xScale.inverse(this.clientToRangeX(clientX, xScale, bounds));
  };

  ScaleGesture.prototype.unscaleY = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, clientY: number, yScale: ContinuousScale<Y, number>, bounds: R2Box): Y {
    return yScale.inverse(this.clientToRangeY(clientY, yScale, bounds));
  };

  ScaleGesture.prototype.viewWillAnimate = function (this: ScaleGesture, viewContext: ViewContext): void {
    MomentumGesture.prototype.viewWillAnimate.call(this, viewContext);
    if ((this.flags & ScaleGesture.NeedsRescale) !== 0) {
      this.rescale();
    }
  };

  ScaleGesture.prototype.onBeginPress = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, input: ScaleGestureInput<X, Y>, event: Event | null): void {
    MomentumGesture.prototype.onBeginPress.call(this, input, event);
    this.updateInputDomain(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  };

  ScaleGesture.prototype.onMovePress = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, input: ScaleGestureInput<X, Y>, event: Event | null): void {
    MomentumGesture.prototype.onMovePress.call(this, input, event);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  };

  ScaleGesture.prototype.onEndPress = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, input: ScaleGestureInput<X, Y>, event: Event | null): void {
    MomentumGesture.prototype.onEndPress.call(this, input, event);
    this.updateInputDomain(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  };

  ScaleGesture.prototype.onCancelPress = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, input: ScaleGestureInput<X, Y>, event: Event | null): void {
    MomentumGesture.prototype.onCancelPress.call(this, input, event);
    this.updateInputDomain(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  };

  ScaleGesture.prototype.beginCoast = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, input: ScaleGestureInput<X, Y>, event: Event | null): void {
    if (this.coastCount < 2) {
      MomentumGesture.prototype.beginCoast.call(this, input, event);
    }
  };

  ScaleGesture.prototype.onBeginCoast = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, input: ScaleGestureInput<X, Y>, event: Event | null): void {
    MomentumGesture.prototype.onBeginCoast.call(this, input, event);
    this.updateInputDomain(input);
    this.conserveMomentum(input);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  };

  ScaleGesture.prototype.onEndCoast = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, input: ScaleGestureInput<X, Y>, event: Event | null): void {
    MomentumGesture.prototype.onEndCoast.call(this, input, event);
    input.disableX = false;
    input.disableY = false;
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  };

  ScaleGesture.prototype.onCoast = function (this: ScaleGesture): void {
    MomentumGesture.prototype.onCoast.call(this);
    this.view!.requireUpdate(View.NeedsAnimate);
    this.setFlags(this.flags | ScaleGesture.NeedsRescale);
  };

  ScaleGesture.prototype.updateInputDomain = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>,
                                                             input: ScaleGestureInput<X, Y>,
                                                             xScale?: ContinuousScale<X, number> | null,
                                                             yScale?: ContinuousScale<Y, number> | null,
                                                             bounds?: R2Box): void {
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
  };

  ScaleGesture.prototype.neutralizeX = function (this: ScaleGesture): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.coasting) {
        input.disableX = true;
        input.vx = 0;
        input.ax = 0;
      }
    }
  };

  ScaleGesture.prototype.neutralizeY = function (this: ScaleGesture): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.coasting) {
        input.disableY = true;
        input.vy = 0;
        input.ay = 0;
      }
    }
  };

  ScaleGesture.prototype.rescale = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>): void {
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
          input0 = input;
        } else if (input.t0 < input1.t0) {
          input1 = input;
        }
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
  };

  ScaleGesture.prototype.rescaleRadial = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>,
                                                         oldXScale: ContinuousScale<X, number>,
                                                         oldYScale: ContinuousScale<Y, number>,
                                                         input0: ScaleGestureInput<X, Y>,
                                                         input1: ScaleGestureInput<X, Y>,
                                                         bounds: R2Box): void {
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
  };

  ScaleGesture.prototype.rescaleXY = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>,
                                                     oldXScale: ContinuousScale<X, number>,
                                                     oldYScale: ContinuousScale<Y, number>,
                                                     input0: ScaleGestureInput<X, Y>,
                                                     input1: ScaleGestureInput<X, Y> | undefined,
                                                     bounds: R2Box): void {
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
  };

  ScaleGesture.prototype.rescaleX = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>,
                                                    oldXScale: ContinuousScale<X, number>,
                                                    input0: ScaleGestureInput<X, Y>,
                                                    input1: ScaleGestureInput<X, Y> | undefined,
                                                    bounds: R2Box): void {
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
        this.setXScale(newXScale);
      }
    }
  };

  ScaleGesture.prototype.rescaleY = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>,
                                                    oldYScale: ContinuousScale<Y, number>,
                                                    input0: ScaleGestureInput<X, Y>,
                                                    input1: ScaleGestureInput<X, Y> | undefined,
                                                    bounds: R2Box): void {
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
        this.setYScale(newYScale);
      }
    }
  };

  ScaleGesture.prototype.conserveMomentum = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, input0: ScaleGestureInput<X, Y>): void {
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
      const xScale = this.getXScale();
      const yScale = this.getYScale();
      if (xScale !== null && yScale !== null) {
        this.distributeXYMomentum(input0, input1);
      } else if (xScale !== null) {
        this.distributeXMomentum(input0, input1);
      } else if (yScale !== null) {
        this.distributeYMomentum(input0, input1);
      }
    }
  };

  ScaleGesture.prototype.distributeXYMomentum = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>,
                                                                input0: ScaleGestureInput<X, Y>,
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
  };

  ScaleGesture.prototype.distributeXMomentum = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>,
                                                               input0: ScaleGestureInput<X, Y>,
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
  };

  ScaleGesture.prototype.distributeYMomentum = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>,
                                                               input0: ScaleGestureInput<X, Y>,
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
  };

  ScaleGesture.prototype.integrate = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, t: number): void {
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
  };

  ScaleGesture.prototype.zoom = function <X, Y>(this: ScaleGesture<unknown, View, X, Y>, x: number, y: number, dz: number, event: Event | null): void {
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
  };

  Object.defineProperty(ScaleGesture.prototype, "observes", {
    value: true,
    enumerable: true,
    configurable: true,
  });

  ScaleGesture.construct = function <G extends ScaleGesture<any, any, any, any>>(gestureClass: {prototype: G}, gesture: G | null, owner: FastenerOwner<G>): G {
    gesture = _super.construct(gestureClass, gesture, owner) as G;
    gesture.distanceMin = ScaleGesture.DistanceMin;
    gesture.setFlags(gesture.flags | ScaleGesture.WheelFlag);
    return gesture;
  };

  ScaleGesture.specialize = function (method: GestureMethod): ScaleGestureFactory | null {
    if (method === "pointer") {
      return PointerScaleGesture;
    } else if (method === "touch") {
      return TouchScaleGesture;
    } else if (method === "mouse") {
      return MouseScaleGesture;
    } else if (typeof PointerEvent !== "undefined") {
      return PointerScaleGesture;
    } else if (typeof TouchEvent !== "undefined") {
      return TouchScaleGesture;
    } else {
      return MouseScaleGesture;
    }
  };

  ScaleGesture.define = function <O, V extends View, X, Y>(className: string, descriptor: ScaleGestureDescriptor<O, V, X, Y>): ScaleGestureFactory<ScaleGesture<any, V, X, Y>> {
    let superClass = descriptor.extends as ScaleGestureFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    let method = descriptor.method;
    const hysteresis = descriptor.hysteresis;
    const acceleration = descriptor.hysteresis;
    const velocityMax = descriptor.hysteresis;
    const distanceMin = descriptor.distanceMin;
    const preserveAspectRatio = descriptor.preserveAspectRatio;
    const wheel = descriptor.wheel;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.method;
    delete descriptor.hysteresis;
    delete descriptor.acceleration;
    delete descriptor.velocityMax;
    delete descriptor.distanceMin;
    delete descriptor.preserveAspectRatio;
    delete descriptor.wheel;

    if (descriptor.key === true) {
      Object.defineProperty(descriptor, "key", {
        value: className,
        configurable: true,
      });
    } else if (descriptor.key === false) {
      Object.defineProperty(descriptor, "key", {
        value: void 0,
        configurable: true,
      });
    }

    if (method === void 0) {
      method = "auto";
    }
    if (superClass === void 0 || superClass === null) {
      superClass = ScaleGesture.specialize(method);
    }
    if (superClass === null) {
      superClass = this;
    }

    const gestureClass = superClass.extend(className, descriptor);

    gestureClass.construct = function (gestureClass: {prototype: ScaleGesture<any, any, any, any>}, gesture: ScaleGesture<O, V, X, Y> | null, owner: O): ScaleGesture<O, V, X, Y> {
      gesture = superClass!.construct(gestureClass, gesture, owner);
      if (affinity !== void 0) {
        gesture.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        gesture.initInherits(inherits);
      }
      if (hysteresis !== void 0) {
        gesture.hysteresis = hysteresis;
      }
      if (acceleration !== void 0) {
        gesture.acceleration = acceleration;
      }
      if (velocityMax !== void 0) {
        gesture.velocityMax = velocityMax;
      }
      if (distanceMin !== void 0) {
        gesture.distanceMin = distanceMin;
      }
      if (preserveAspectRatio !== void 0) {
        gesture.preserveAspectRatio = preserveAspectRatio;
      }
      if (wheel !== void 0) {
        gesture.wheel = wheel;
      }
      return gesture;
    };

    return gestureClass;
  };

  (ScaleGesture as Mutable<typeof ScaleGesture>).DistanceMin = 10;

  (ScaleGesture as Mutable<typeof ScaleGesture>).PreserveAspectRatioFlag = 1 << (_super.FlagShift + 0);
  (ScaleGesture as Mutable<typeof ScaleGesture>).WheelFlag = 1 << (_super.FlagShift + 1);
  (ScaleGesture as Mutable<typeof ScaleGesture>).NeedsRescale = 1 << (_super.FlagShift + 2);

  (ScaleGesture as Mutable<typeof ScaleGesture>).FlagShift = _super.FlagShift + 3;
  (ScaleGesture as Mutable<typeof ScaleGesture>).FlagMask = (1 << ScaleGesture.FlagShift) - 1;

  return ScaleGesture;
})(MomentumGesture);
