// Copyright 2015-2020 SWIM.AI inc.
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

import {Objects} from "@swim/util";
import {ContinuousScale, LinearScale, TimeScale} from "@swim/scale";
import {CustomEvent} from "@swim/dom";
import {View, RenderedView, ElementView} from "@swim/view";
import {MultitouchEvent, MultitouchPoint, Multitouch} from "./Multitouch";

export interface ScaleGestureEventInit<D> extends CustomEventInit {
  composed?: boolean;
  gesture: ScaleGesture<D>;
  multitouch: Multitouch;
  ruler: View;
  scale: ContinuousScale<D, number>;
  originalEvent?: Event | null;
}

export class ScaleGestureEvent<D> extends CustomEvent {
  gesture: ScaleGesture<D>;
  multitouch: Multitouch;
  ruler: View;
  scale: ContinuousScale<D, number>;
  readonly originalEvent: Event | null;

  constructor(type: string, init: ScaleGestureEventInit<D>) {
    super(type, init);
    this.gesture = init.gesture;
    this.multitouch = init.multitouch;
    this.ruler = init.ruler;
    this.scale = init.scale;
    this.originalEvent = init.originalEvent || null;
  }
}

/** @hidden */
export interface ScaleGesturePoint<D> {
  readonly identifier: string;
  domainCoord: D;
  rangeCoord: number;
}

export abstract class ScaleGesture<D> {
  /** @hidden */
  protected _multitouch: Multitouch | null;
  /** @hidden */
  protected _ruler: View | null;
  /** @hidden */
  protected _scale: ContinuousScale<D, number> | null;
  /** @hidden */
  protected _xMin: D | null;
  /** @hidden */
  protected _xMax: D | null;
  /** @hidden */
  protected _zMin: number | null;
  /** @hidden */
  protected _zMax: number | null;
  /** @hidden */
  protected readonly _points: ScaleGesturePoint<D>[];

  constructor() {
    this._multitouch = null;
    this._ruler = null;
    this._scale = null;
    this._xMin = null;
    this._xMax = null;
    this._zMin = null;
    this._zMax = null;
    this._points = [];

    this.onMultitouchStart = this.onMultitouchStart.bind(this);
    this.onMultitouchChange = this.onMultitouchChange.bind(this);
    this.onMultitouchCancel = this.onMultitouchCancel.bind(this);
    this.onMultitouchEnd = this.onMultitouchEnd.bind(this);
  }

  multitouch(): Multitouch | null;
  multitouch(multitouch: Multitouch | null): this;
  multitouch(multitouch?: Multitouch | null): Multitouch | null | this {
    if (multitouch === void 0) {
      return this._multitouch;
    } else {
      if (this._multitouch) {
        this.detach(this._multitouch);
      }
      this._multitouch = multitouch;
      return this;
    }
  }

  hysteresis(): number;
  hysteresis(hysteresis: number): this;
  hysteresis(hysteresis?: number): number | this {
    if (hysteresis === void 0) {
      return this._multitouch!.hysteresis();
    } else {
      this._multitouch!.hysteresis(hysteresis);
      return this;
    }
  }

  acceleration(): number;
  acceleration(acceleration: number): this;
  acceleration(acceleration?: number): number | this {
    if (acceleration === void 0) {
      return this._multitouch!.acceleration();
    } else {
      this._multitouch!.acceleration(acceleration);
      return this;
    }
  }

  velocityMax(): number;
  velocityMax(velocityMax: number): this;
  velocityMax(velocityMax?: number): number | this {
    if (velocityMax === void 0) {
      return this._multitouch!.velocityMax();
    } else {
      this._multitouch!.velocityMax(velocityMax);
      return this;
    }
  }

  distanceMin(): number;
  distanceMin(distanceMin: number): this;
  distanceMin(distanceMin?: number): number | this {
    if (distanceMin === void 0) {
      return this._multitouch!.distanceMin();
    } else {
      this._multitouch!.distanceMin(distanceMin);
      return this;
    }
  }

  wheel(): boolean;
  wheel(wheel: boolean): this;
  wheel(wheel?: boolean): boolean | this {
    if (wheel === void 0) {
      return this._multitouch!.wheel();
    } else {
      this._multitouch!.wheel(wheel);
      return this;
    }
  }

  ruler(): View | null;
  ruler(ruler: View | null): this;
  ruler(ruler?: View | null): View | null | this {
    if (ruler === void 0) {
      return this._ruler;
    } else {
      this._ruler = ruler;
      return this;
    }
  }

  scale(): ContinuousScale<D, number> | null;
  scale(scale: ContinuousScale<D, number> | null): this;
  scale(scale?: ContinuousScale<D, number> | null): ContinuousScale<D, number> | null | this {
    if (scale === void 0) {
      return this._scale;
    } else {
      const oldScale = this._scale;
      this._scale = scale;
      if (oldScale === null) {
        this.zoomBounds(true);
      }
      return this;
    }
  }

  domainMin(): D | null;
  domainMin(xMin: D | null): this;
  domainMin(xMin?: D | null): D | null | this {
    if (xMin === void 0) {
      return this._xMin;
    } else {
      this._xMin = xMin;
      return this;
    }
  }

  domainMax(): D | null;
  domainMax(xMax: D | null): this;
  domainMax(xMax?: D | null): D | null | this {
    if (xMax === void 0) {
      return this._xMax;
    } else {
      this._xMax = xMax;
      return this;
    }
  }

  domainBounds(): (D | null)[];
  domainBounds(xMin: (D | null)[] | D | null, xMax?: D | null): this;
  domainBounds(xMin?: (D | null)[] | D | null, xMax?: D | null): (D | null)[] | this {
    if (xMin === void 0) {
      return [this._xMin, this._xMax];
    } else if (xMax === void 0) {
      xMin = xMin as (D | null)[];
      this._xMin = xMin[0];
      this._xMax = xMin[1];
      return this;
    } else {
      this._xMin = xMin as D | null;
      this._xMax = xMax;
      return this;
    }
  }

  zoomMin(): number | null;
  zoomMin(zMin: number | null): this;
  zoomMin(zMin?: number | null): number | null | this {
    if (zMin === void 0) {
      return this._zMin;
    } else {
      this._zMin = zMin;
      return this;
    }
  }

  zoomMax(): number | null;
  zoomMax(zMax: number | null): this;
  zoomMax(zMax?: number | null): number | null | this {
    if (zMax === void 0) {
      return this._zMax;
    } else {
      this._zMax = zMax;
      return this;
    }
  }

  zoomBounds(): (number | null)[];
  zoomBounds(zMin: boolean | (number | null)[] | number | null, zMax?: number | null): this;
  zoomBounds(zMin?: boolean | (number | null)[] | number | null, zMax?: number | null): (number | null)[] | this {
    if (zMin === void 0) {
      return [this._zMin, this._zMax];
    } else if (zMax === void 0) {
      if (typeof zMin === "boolean") {
        if (this._scale instanceof LinearScale) {
          this._zMin = 1000000;
          this._zMax = 0.001;
        } else if (this._scale instanceof TimeScale) {
          this._zMin = 86400000;
          this._zMax = 1;
        }
      } else {
        zMin = zMin as (number | null)[];
        this._zMin = zMin[0];
        this._zMax = zMin[1];
      }
      return this;
    } else {
      this._zMin = zMin as number | null;
      this._zMax = zMax;
      return this;
    }
  }

  attach(multitouch: Multitouch): void {
    const surface = this._multitouch && this._multitouch.surface();
    if (surface) {
      surface.on("multitouchstart", this.onMultitouchStart);
      surface.on("multitouchchange", this.onMultitouchChange);
      surface.on("multitouchcancel", this.onMultitouchCancel);
      surface.on("multitouchend", this.onMultitouchEnd);
    }
  }

  detach(multitouch: Multitouch): void {
    const surface = this._multitouch && this._multitouch.surface();
    if (surface) {
      surface.off("multitouchstart", this.onMultitouchStart);
      surface.off("multitouchchange", this.onMultitouchChange);
      surface.off("multitouchcancel", this.onMultitouchCancel);
      surface.off("multitouchend", this.onMultitouchEnd);
    }
  }

  protected createPoint(gesturePoint: MultitouchPoint): ScaleGesturePoint<D> {
    const coords = this.coords(gesturePoint.cx, gesturePoint.cy);
    return {
      identifier: gesturePoint.identifier,
      domainCoord: coords.domainCoord,
      rangeCoord: coords.rangeCoord,
    };
  }

  protected updatePoint(gesturePoint: MultitouchPoint, scalePoint: ScaleGesturePoint<D>): void {
    scalePoint.rangeCoord = this.rangeCoord(gesturePoint.cx, gesturePoint.cy);
  }

  updatePoints(gesturePoints: ReadonlyArray<MultitouchPoint>): void {
    const scalePoints = this._points;
    outer: for (let i = 0; i < gesturePoints.length; i += 1) {
      const gesturePoint = gesturePoints[i];
      for (let j = 0; j < scalePoints.length; j += 1) {
        const scalePoint = scalePoints[j];
        if (Objects.equal(gesturePoint.identifier, scalePoint.identifier)) {
          this.updatePoint(gesturePoint, scalePoint);
          continue outer;
        }
      }
      const scalePoint = this.createPoint(gesturePoint);
      scalePoints.push(scalePoint);
    }
    let j = 0;
    outer: while (j < scalePoints.length) {
      const scalePoint = scalePoints[j];
      for (let i = 0; i < gesturePoints.length; i += 1) {
        const gesturePoint = gesturePoints[i];
        if (Objects.equal(scalePoint.identifier, gesturePoint.identifier)) {
          j += 1;
          continue outer;
        }
      }
      scalePoints.splice(j, 1);
    }
  }

  protected clampScale(): boolean {
    const _xMin = this._xMin !== null ? this._xMin : void 0;
    const _xMax = this._xMax !== null ? this._xMax : void 0;
    const _zMin = this._zMin !== null ? this._zMin : void 0;
    const _zMax = this._zMax !== null ? this._zMax : void 0;
    const scale = this._scale!;
    this._scale = scale.clampDomain(_xMin, _xMax, _zMin, _zMax);
    if (this._scale !== scale) {
      for (let i = 0; i < this._points.length; i += 1) {
        const scalePoint = this._points[i];
        scalePoint.domainCoord = this._scale.unscale(scalePoint.rangeCoord);
      }
      return true;
    } else {
      return false;
    }
  }

  protected rescale(): boolean {
    const p0 = this._points[0];
    const p1 = this._points[1];
    const oldScale = this._scale!;
    if (p0 && p1) {
      const x0 = p0.domainCoord;
      const y0 = p0.rangeCoord;
      const x1 = p1.domainCoord;
      const y1 = p1.rangeCoord;
      this._scale = oldScale.solveDomain(x0, y0, x1, y1);
      this.clampScale();
    } else if (p0) {
      const x0 = p0.domainCoord;
      const y0 = p0.rangeCoord;
      this._scale = oldScale.solveDomain(x0, y0);
      this.clampScale();
    }
    return !oldScale.equals(this._scale);
  }

  protected onMultitouchStart(event: MultitouchEvent): void {
    this.scaleStart(event);
  }

  protected onMultitouchChange(event: MultitouchEvent): void {
    this.updatePoints(event.points);
    const changed = this.rescale();
    if (changed) {
      this.scaleChange(event);
    }
  }

  protected onMultitouchCancel(event: MultitouchEvent): void {
    this.scaleCancel(event);
  }

  protected onMultitouchEnd(event: MultitouchEvent): void {
    this.scaleEnd(event);
  }

  protected scaleStart(originalEvent: Event | null): void {
    const event = new ScaleGestureEvent("scalestart", {
      bubbles: true,
      cancelable: true,
      composed: true,
      gesture: this,
      multitouch: this._multitouch!,
      ruler: this._ruler!,
      scale: this._scale!,
      originalEvent: originalEvent,
    });
    this._ruler!.dispatchEvent(event);
  }

  protected scaleChange(originalEvent: Event | null): void {
    const event = new ScaleGestureEvent("scalechange", {
      bubbles: true,
      cancelable: true,
      composed: true,
      gesture: this,
      multitouch: this._multitouch!,
      ruler: this._ruler!,
      scale: this._scale!,
      originalEvent: originalEvent,
    });
    this._ruler!.dispatchEvent(event);
  }

  protected scaleCancel(originalEvent: Event | null): void {
    const event = new ScaleGestureEvent("scalecancel", {
      bubbles: true,
      cancelable: true,
      composed: true,
      gesture: this,
      multitouch: this._multitouch!,
      ruler: this._ruler!,
      scale: this._scale!,
      originalEvent: originalEvent,
    });
    this._ruler!.dispatchEvent(event);
    this._points.length = 0;
  }

  protected scaleEnd(originalEvent: Event | null): void {
    const event = new ScaleGestureEvent("scaleend", {
      bubbles: true,
      cancelable: true,
      composed: true,
      gesture: this,
      multitouch: this._multitouch!,
      ruler: this._ruler!,
      scale: this._scale!,
      originalEvent: originalEvent,
    });
    this._ruler!.dispatchEvent(event);
    this._points.length = 0;
  }

  protected abstract coords(clientX: number, clientY: number): {domainCoord: D, rangeCoord: number};

  protected abstract rangeCoord(clientX: number, clientY: number): number;

  protected abstract isParallel(x0: number, y0: number, x1: number, y1: number): boolean;

  static horizontal<D>(): HorizontalScaleGesture<D> {
    return new HorizontalScaleGesture();
  }

  static vertical<D>(): VerticalScaleGesture<D> {
    return new VerticalScaleGesture();
  }
}

export class HorizontalScaleGesture<D> extends ScaleGesture<D> {
  protected coords(clientX: number, clientY: number): {domainCoord: D, rangeCoord: number} {
    let ruler = this._ruler;
    const dx = RenderedView.is(ruler) ? ruler.bounds.x : 0;
    do {
      if (ruler instanceof ElementView) {
        const bounds = ruler.node.getBoundingClientRect();
        const rangeCoord = clientX - bounds.left - dx;
        const domainCoord = this._scale!.unscale(rangeCoord);
        return {domainCoord, rangeCoord};
      } else if (ruler) {
        ruler = ruler.parentView;
      } else {
        break;
      }
    } while (true);
    throw new Error("" + this._ruler);
  }

  protected rangeCoord(clientX: number, clientY: number): number {
    let ruler = this._ruler;
    const dx = RenderedView.is(ruler) ? ruler.bounds.x : 0;
    do {
      if (ruler instanceof ElementView) {
        const bounds = ruler.node.getBoundingClientRect();
        const rangeCoord = clientX - bounds.left - dx;
        return rangeCoord;
      } else if (ruler) {
        ruler = ruler.parentView;
      } else {
        break;
      }
    } while (true);
    throw new Error("" + this._ruler);
  }

  protected isParallel(x0: number, y0: number, x1: number, y1: number): boolean {
    return Math.abs(x1 - x0) >= Math.abs(y1 - y0);
  }
}

export class VerticalScaleGesture<D> extends ScaleGesture<D> {
  protected coords(clientX: number, clientY: number): {domainCoord: D, rangeCoord: number} {
    let ruler = this._ruler;
    const dy = RenderedView.is(ruler) ? ruler.bounds.y : 0;
    do {
      if (ruler instanceof ElementView) {
        const bounds = ruler.node.getBoundingClientRect();
        const rangeCoord = clientY - bounds.top - dy;
        const domainCoord = this._scale!.unscale(rangeCoord);
        return {domainCoord, rangeCoord};
      } else if (ruler) {
        ruler = ruler.parentView;
      } else {
        break;
      }
    } while (true);
    throw new Error("" + this._ruler);
  }

  protected rangeCoord(clientX: number, clientY: number): number {
    let ruler = this._ruler;
    const dy = RenderedView.is(ruler) ? ruler.bounds.y : 0;
    do {
      if (ruler instanceof ElementView) {
        const bounds = ruler.node.getBoundingClientRect();
        const rangeCoord = clientY - bounds.top - dy;
        return rangeCoord;
      } else if (ruler) {
        ruler = ruler.parentView;
      } else {
        break;
      }
    } while (true);
    throw new Error("" + this._ruler);
  }

  protected isParallel(x0: number, y0: number, x1: number, y1: number): boolean {
    return Math.abs(y1 - y0) >= Math.abs(x1 - x0);
  }
}
