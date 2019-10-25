// Copyright 2015-2019 SWIM.AI inc.
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

import {CustomEvent} from "@swim/dom";
import {View, ElementView} from "@swim/view";

const COS_PI_4 = Math.cos(Math.PI / 4);
const SIN_PI_4 = Math.sin(Math.PI / 4);

export interface MultitouchEventInit extends EventInit {
  composed?: boolean;
  points: MultitouchPoint[];
  originalEvent?: Event | null;
}

export class MultitouchEvent extends CustomEvent {
  readonly points: ReadonlyArray<MultitouchPoint>;
  readonly originalEvent: Event | null;

  constructor(type: string, init: MultitouchEventInit) {
    super(type, init);
    this.points = init.points;
    this.originalEvent = init.originalEvent || null;
  }
}

export interface MultitouchPoint {
  readonly identifier: string;
  readonly ghost: boolean;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  dx: number;
  dy: number;
}

/** @hidden */
export class MultitouchTrack implements MultitouchPoint {
  readonly multitouch: Multitouch;
  readonly identifier: string;
  readonly path: {t: number; cx: number; cy: number;}[];
  t: number;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  dx: number;
  dy: number;

  constructor(multitouch: Multitouch, identifier: string) {
    this.multitouch = multitouch;
    this.identifier = identifier;
    this.path = [];
    this.t = NaN;
    this.cx = NaN;
    this.cy = NaN;
    this.vx = NaN;
    this.vy = NaN;
    this.ax = NaN;
    this.ay = NaN;
    this.dx = NaN;
    this.dy = NaN;
  }

  get ghost(): boolean {
    return false;
  }

  moveTo(t: number, cx: number, cy: number): void {
    this.path.push({t: t, cx: cx, cy: cy});
    while (this.path.length > 1) {
      if (t - this.path[0].t > this.multitouch._hysteresis) {
        this.path.splice(0, 1);
      } else {
        break;
      }
    }
    this.update();
  }

  update(): void {
    const p0 = this.path[0];
    const p1 = this.path[this.path.length - 1];
    if (p1 && p1 !== p0) {
      const dt = p1.t - p0.t;
      let vx: number;
      let vy: number;
      if (dt) {
        vx = (p1.cx - p0.cx) / dt;
        vy = (p1.cy - p0.cy) / dt;
        const v2 = vx * vx + vy * vy;
        const vMax = this.multitouch._velocityMax;
        const vMax2 = vMax * vMax;
        if (vMax2 < v2) {
          const v = Math.sqrt(v2);
          vx = vx * vMax / v;
          vy = vy * vMax / v;
        }
      } else {
        vx = 0;
        vy = 0;
      }
      this.t = p1.t;
      this.dx = p1.cx - this.cx;
      this.dy = p1.cy - this.cy;
      this.cx = p1.cx;
      this.cy = p1.cy;
      this.vx = vx;
      this.vy = vy;
    } else if (p0) {
      this.t = p0.t;
      this.dx = p0.cx - this.cx;
      this.dy = p0.cy - this.cy;
      this.cx = p0.cx;
      this.cy = p0.cy;
      this.vx = 0;
      this.vy = 0;
    }
  }
}

/** @hidden */
export class MultitouchGhost implements MultitouchPoint {
  readonly multitouch: Multitouch;
  readonly identifier: string;
  t: number;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  dx: number;
  dy: number;

  constructor(multitouch: Multitouch, identifier: string, t: number, cx: number, cy: number,
              vx: number, vy: number, ax: number, ay: number) {
    this.multitouch = multitouch;
    this.identifier = identifier;
    this.t = t;
    this.cx = cx;
    this.cy = cy;
    this.vx = vx;
    this.vy = vy;
    this.ax = ax;
    this.ay = ay;
    this.dx = 0;
    this.dy = 0;
  }

  get ghost(): boolean {
    return true;
  }

  translate(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  update(t: number): void {
    const dt = t - this.t;
    if (dt) {
      let vx = this.vx + this.ax * dt;
      let cx;
      if (vx < 0 === this.vx < 0) {
        cx = this.cx + this.vx * dt + 0.5 * (this.ax * dt * dt);
      } else {
        cx = this.cx - (this.vx * this.vx) / (2 * this.ax);
        vx = 0;
        this.ax = 0;
      }

      let vy = this.vy + this.ay * dt;
      let cy;
      if (vy < 0 === this.vy < 0) {
        cy = this.cy + this.vy * dt + 0.5 * (this.ay * dt * dt);
      } else {
        cy = this.cy - (this.vy * this.vy) / (2 * this.ay);
        vy = 0;
        this.ay = 0;
      }

      this.dx = cx - this.cx;
      this.dy = cy - this.cy;
      this.cx = cx;
      this.cy = cy;
      this.vx = vx;
      this.vy = vy;
      this.t = t;
    }
  }
}

export abstract class Multitouch {
  /** @hidden */
  protected _surface: View | null;
  /** @hidden */
  protected _tracks: {[id: string]: MultitouchTrack};
  /** @hidden */
  protected _trackCount: number;
  /** @hidden */
  protected _ghosts: {[id: string]: MultitouchGhost};
  /** @hidden */
  protected _ghostCount: number;
  /** @hidden */
  protected _ghostFrame: number;
  /**
   * Hysteresis for velocity derivation, in milliseconds.
   * @hidden
   */
  _hysteresis: number;
  /**
   * Acceleration on contact points, in pixels/millisecond^2.
   * @hidden
   */
  _acceleration: number;
  /**
   * Maximum velocity of contact points, in pixels/millisecond.
   * @hidden
   */
  _velocityMax: number;
  /**
   * Minimum distance between contact points, in pixels.
   * @hidden
   */
  _distanceMin: number;

  constructor() {
    this._surface = null;
    this._tracks = {};
    this._trackCount = 0;
    this._ghosts = {};
    this._ghostCount = 0;
    this._ghostFrame = 0;
    this._hysteresis = 67;
    this._acceleration = 0.00175;
    this._velocityMax = 1.75;
    this._distanceMin = 10;

    this.onGhostFrame = this.onGhostFrame.bind(this);
  }

  surface(): View | null;
  surface(surface: View | null): this;
  surface(surface?: View | null): View | null | this {
    if (surface === void 0) {
      return this._surface;
    } else {
      if (this._surface) {
        this.detach(this._surface);
      }
      this._surface = surface;
      return this;
    }
  }

  /** @hidden */
  target(): ElementView | null {
    let view = this._surface;
    while (view) {
      if (view instanceof ElementView) {
        return view;
      }
      view = view.parentView;
    }
    return null;
  }

  hysteresis(): number;
  hysteresis(hysteresis: number): this;
  hysteresis(hysteresis?: number): number | this {
    if (hysteresis === void 0) {
      return this._hysteresis;
    } else {
      this._hysteresis = hysteresis;
      return this;
    }
  }

  acceleration(): number;
  acceleration(acceleration: number): this;
  acceleration(acceleration?: number): number | this {
    if (acceleration === void 0) {
      return this._acceleration;
    } else {
      this._acceleration = acceleration;
      return this;
    }
  }

  velocityMax(): number;
  velocityMax(velocityMax: number): this;
  velocityMax(velocityMax?: number): number | this {
    if (velocityMax === void 0) {
      return this._velocityMax;
    } else {
      this._velocityMax = velocityMax;
      return this;
    }
  }

  distanceMin(): number;
  distanceMin(distanceMin: number): this;
  distanceMin(distanceMin?: number): number | this {
    if (distanceMin === void 0) {
      return this._distanceMin;
    } else {
      this._distanceMin = distanceMin;
      return this;
    }
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

  points(): MultitouchPoint[] {
    const points = [];
    for (const identifier in this._tracks) {
      points.push(this._tracks[identifier]);
    }
    for (const identifier in this._ghosts) {
      points.push(this._ghosts[identifier]);
    }
    return points;
  }

  interrupt(originalEvent: Event | null): void {
    if (this._ghostFrame) {
      cancelAnimationFrame(this._ghostFrame);
      this._ghostFrame = 0;
    }
    if (this._ghostCount) {
      this._ghosts = {};
      this._ghostCount = 0;
      if (this._trackCount) {
        this.multitouchChange(originalEvent);
      } else {
        this.multitouchEnd(originalEvent);
      }
    }
  }

  zoom(cx: number, cy: number, dz: number, originalEvent: Event | null): void {
    if (!dz) {
      return;
    }
    const t = Date.now();
    const a = this._acceleration;
    let ax = a * COS_PI_4;
    let ay = a * SIN_PI_4;
    const vMax = this._velocityMax;
    const vx = 0.5 * vMax * COS_PI_4;
    const vy = 0.5 * vMax * SIN_PI_4;
    const dx = (4 * vx * vx) / ax;
    const dy = (4 * vy * vy) / ay;

    let zoom0 = this._ghosts.zoom0;
    let zoom1 = this._ghosts.zoom1;
    if (zoom0 && zoom1) {
      const dcx = Math.abs(zoom1.cx - zoom0.cx) / 2;
      const dcy = Math.abs(zoom1.cy - zoom0.cy) / 2;
      const dt = t - zoom0.t;
      dz = Math.min(Math.max(-vMax * dt, dz), vMax * dt);
      const zx = (dz * dcx * COS_PI_4) / dx;
      const zy = (dz * dcy * SIN_PI_4) / dy;
      ax = (ax * dcx) / dx;
      ay = (ay * dcy) / dy;

      if (dt > 0) {
        zoom0.t = t;
        zoom0.cx += zx;
        zoom0.cy += zy;
        zoom0.vx = zx / dt;
        zoom0.vy = zy / dt;
        zoom0.ax = zoom0.vx < 0 ? ax : zoom0.vx > 0 ? -ax : 0;
        zoom0.ay = zoom0.vy < 0 ? ay : zoom0.vy > 0 ? -ay : 0;
        zoom0.dx = zx;
        zoom0.dy = zy;

        zoom1.t = t;
        zoom1.cx -= zx;
        zoom1.cy -= zy;
        zoom1.vx = -zx / dt;
        zoom1.vy = -zy / dt;
        zoom1.ax = zoom1.vx < 0 ? ax : zoom1.vx > 0 ? -ax : 0;
        zoom1.ay = zoom1.vy < 0 ? ay : zoom1.vy > 0 ? -ay : 0;
        zoom1.dx = -zx;
        zoom1.dy = -zy;
      }
    } else {
      this.interrupt(originalEvent);
      this.multitouchStart(originalEvent);

      if (dz < 0) {
        zoom0 = new MultitouchGhost(this, "zoom0", t, cx - dx, cy - dy, -vx, -vy, ax, ay);
        zoom1 = new MultitouchGhost(this, "zoom1", t, cx + dx, cy + dy, vx, vy, -ax, -ay);
      } else {
        zoom0 = new MultitouchGhost(this, "zoom0", t, cx - dx, cy - dy, vx, vy, -ax, -ay);
        zoom1 = new MultitouchGhost(this, "zoom1", t, cx + dx, cy + dy, -vx, -vy, ax, ay);
      }

      this._ghosts.zoom0 = zoom0;
      this._ghostCount += 1;
      this._ghosts.zoom1 = zoom1;
      this._ghostCount += 1;
    }

    this.multitouchChange(originalEvent);
    if (this._ghostFrame) {
      cancelAnimationFrame(this._ghostFrame);
    }
    this._ghostFrame = requestAnimationFrame(this.onGhostFrame);
  }

  protected updateVelocity(t: number, points: MultitouchPoint[]): void {
    const p0 = points[0];
    const p1 = points[1];
    let i = 0;
    if (p0 && p1) {
      i = 2;
      const dx0 = Math.abs(p1.cx - p0.cx);
      const dy0 = Math.abs(p1.cy - p0.cy);
      if (p0 instanceof MultitouchGhost) {
        p0.update(t);
      }
      if (p1 instanceof MultitouchGhost) {
        p1.update(t);
      }
      const dx1 = Math.abs(p1.cx - p0.cx);
      const dy1 = Math.abs(p1.cy - p0.cy);
      const sx = dx1 / dx0;
      const sy = dy1 / dy0;

      p0.vx *= sx;
      p0.vy *= sy;
      p0.ax *= sx;
      p0.ay *= sy;

      p1.vx *= sx;
      p1.vy *= sy;
      p1.ax *= sx;
      p1.ay *= sy;
    }
    while (i < points.length) {
      const p = points[i];
      if (p instanceof MultitouchGhost) {
        p.update(t);
      }
      i += 1;
    }
  }

  protected spreadVelocity(track: MultitouchTrack): void {
    for (const identifier in this._ghosts) {
      const ghost = this._ghosts[identifier];
      if (track.vx < 0 === ghost.vx < 0) {
        track.vx = (track.vx + ghost.vx) / 2;
        ghost.vx = (track.vx + ghost.vx) / 2;
      } else {
        track.vx = (track.vx - ghost.vx) / 2;
        ghost.vx = (ghost.vx - track.vx) / 2;
      }
      if (track.vy < 0 === ghost.vy < 0) {
        track.vy = (track.vy + ghost.vy) / 2;
        ghost.vy = (track.vy + ghost.vy) / 2;
      } else {
        track.vy = (track.vy - ghost.vy) / 2;
        ghost.vy = (ghost.vy - track.vy) / 2;
      }
    }
  }

  protected coast(track: MultitouchTrack): void {
    if (track.vx || track.vy) {
      this.spreadVelocity(track);
      const alpha = Math.atan2(Math.abs(track.vy), Math.abs(track.vx));
      const a = this._acceleration;
      const ax = (track.vx < 0 ? a : track.vx > 0 ? -a : 0) * Math.cos(alpha);
      const ay = (track.vy < 0 ? a : track.vy > 0 ? -a : 0) * Math.sin(alpha);
      if (ax || ay) {
        const ghost = new MultitouchGhost(this, track.identifier, track.t, track.cx, track.cy,
                                          track.vx, track.vy, ax, ay);
        this._ghosts[ghost.identifier] = ghost;
        this._ghostCount += 1;
        if (!this._ghostFrame) {
          this._ghostFrame = requestAnimationFrame(this.onGhostFrame);
        }
      }
    }
  }

  protected translate(dx: number, dy: number): void {
    dx = dx || 0;
    dy = dy || 0;
    for (const identifier in this._ghosts) {
      this._ghosts[identifier].translate(dx, dy);
    }
  }

  protected interpolate(t: number): void {
    for (const identifier in this._tracks) {
      this._tracks[identifier].update();
    }
    this.updateVelocity(t, this.points());
    this.multitouchChange(null);

    for (const identifier in this._ghosts) {
      const ghost = this._ghosts[identifier];
      if (!ghost.ax && !ghost.ay) {
        this._ghostCount -= 1;
      }
    }

    if (!this._trackCount && !this._ghostCount) {
      this.multitouchEnd(null);
    } else if (this._ghostCount && !this._ghostFrame) {
      this._ghostFrame = requestAnimationFrame(this.onGhostFrame);
    }

    for (const identifier in this._ghosts) {
      const ghost = this._ghosts[identifier];
      if (!ghost.ax && !ghost.ay) {
        delete this._ghosts[identifier];
      }
    }
  }

  protected onGhostFrame(t: number): void {
    this._ghostFrame = 0;
    this.interpolate(Date.now());
  }

  protected multitouchStart(originalEvent: Event | null): void {
    const event = new MultitouchEvent("multitouchstart", {
      bubbles: true,
      cancelable: true,
      composed: true,
      points: this.points(),
      originalEvent: originalEvent,
    });
    this._surface!.dispatchEvent(event);
  }

  protected multitouchChange(originalEvent: Event | null): void {
    const event = new MultitouchEvent("multitouchchange", {
      bubbles: true,
      cancelable: true,
      composed: true,
      points: this.points(),
      originalEvent: originalEvent,
    });
    this._surface!.dispatchEvent(event);
  }

  protected multitouchCancel(originalEvent: Event | null): void {
    const event = new MultitouchEvent("multitouchcancel", {
      bubbles: true,
      cancelable: true,
      composed: true,
      points: this.points(),
      originalEvent: originalEvent,
    });
    this._surface!.dispatchEvent(event);
  }

  protected multitouchEnd(originalEvent: Event | null): void {
    const event = new MultitouchEvent("multitouchend", {
      bubbles: true,
      cancelable: true,
      composed: true,
      points: this.points(),
      originalEvent: originalEvent,
    });
    this._surface!.dispatchEvent(event);
  }

  protected trackStart(identifier: string, clientX: number, clientY: number, event: Event): void {
    this.interrupt(event);

    const track = new MultitouchTrack(this, identifier);
    this._tracks[identifier] = track;
    track.moveTo(Date.now(), clientX, clientY);

    this._trackCount += 1;
    if (this._trackCount === 1) {
      const target = this.target();
      if (target) {
        this.startTracking(target);
      }
    }
    this.trackDidStart(track, this._surface!, event);
  }

  protected trackMove(identifier: string, clientX: number, clientY: number, event: Event): void {
    const track = this._tracks[identifier];
    if (track) {
      track.moveTo(Date.now(), clientX, clientY);
      this.trackDidMove(track, this._surface!, event);
    }
  }

  protected trackCancel(identifier: string, clientX: number, clientY: number, event: Event): void {
    const track = this._tracks[identifier];
    if (track) {
      this._trackCount -= 1;
      track.update();
      this.trackDidCancel(track, this._surface!, event);
      if (this._trackCount === 0) {
        const target = this.target();
        if (target) {
          this.endTracking(target);
        }
      }
      delete this._tracks[identifier];
    }
  }

  protected trackEnd(identifier: string, clientX: number, clientY: number, event: Event): void {
    const track = this._tracks[identifier];
    if (track) {
      this._trackCount -= 1;
      track.update();
      this.trackDidEnd(track, this._surface!, event);
      if (this._trackCount === 0) {
        const target = this.target();
        if (target) {
          this.endTracking(target);
        }
      }
      delete this._tracks[identifier];
    }
  }

  protected trackDidStart(track: MultitouchTrack, surface: View, event: Event): void {
    if (this._trackCount === 1) {
      this.multitouchStart(event);
    }
  }

  protected trackDidMove(track: MultitouchTrack, surface: View, event: Event): void {
    this.translate(track.dx, track.dy);
    this.interpolate(Date.now());
  }

  protected trackDidCancel(track: MultitouchTrack, surface: View, event: Event): void {
    if (!this._trackCount && !this._ghostCount) {
      this.multitouchCancel(event);
    }
  }

  protected trackDidEnd(track: MultitouchTrack, surface: View, event: Event): void {
    this.coast(track);
    if (!this._trackCount && !this._ghostCount) {
      this.multitouchEnd(event);
    }
  }

  abstract attach(surface: View): void;

  abstract detach(surface: View): void;

  protected abstract startTracking(surface: View): void;

  protected abstract endTracking(surface: View): void;

  static create(): Multitouch {
    if (typeof PointerEvent !== "undefined") {
      return new MultitouchPointer();
    } else if (typeof TouchEvent !== "undefined") {
      return new MultitouchTouch();
    } else {
      return new MultitouchMouse();
    }
  }
}

export class MultitouchPointer extends Multitouch {
  protected _wheel: boolean;

  constructor() {
    super();
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this._wheel = true;
  }

  wheel(): boolean;
  wheel(wheel: boolean): this;
  wheel(wheel?: boolean): boolean | this {
    if (wheel === void 0) {
      return this._wheel;
    } else {
      if (this._wheel !== wheel) {
        this._wheel = wheel;
        const target = this.target();
        if (target) {
          if (wheel) {
            target.on("wheel", this.onWheel);
          } else {
            target.off("wheel", this.onWheel);
          }
        }
      }
      return this;
    }
  }

  attach(surface: View): void {
    const target = this.target();
    if (target) {
      target.on("pointerdown", this.onPointerDown);
      if (this._wheel) {
        target.on("wheel", this.onWheel);
      }
    }
  }

  detach(surface: View): void {
    const target = this.target();
    if (target) {
      target.off("pointerdown", this.onPointerDown);
      target.off("wheel", this.onWheel);
    }
  }

  protected startTracking(surface: View): void {
    const target = this.target();
    if (target) {
      target.on("pointermove", this.onPointerMove);
      target.on("pointercancel", this.onPointerCancel);
      target.on("pointerup", this.onPointerUp);
    }
  }

  protected endTracking(surface: View): void {
    const target = this.target();
    if (target) {
      target.off("pointermove", this.onPointerMove);
      target.off("pointercancel", this.onPointerCancel);
      target.off("pointerup", this.onPointerUp);
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    this.trackStart("" + event.pointerId, event.clientX, event.clientY, event);
    const target = this.target();
    if (target && target.node.setPointerCapture) {
      target.node.setPointerCapture(event.pointerId);
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    this.trackMove("" + event.pointerId, event.clientX, event.clientY, event);
  }

  protected onPointerCancel(event: PointerEvent): void {
    this.trackCancel("" + event.pointerId, event.clientX, event.clientY, event);
    const target = this.target();
    if (target && target.node.releasePointerCapture) {
      target.node.releasePointerCapture(event.pointerId);
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    this.trackEnd("" + event.pointerId, event.clientX, event.clientY, event);
    const target = this.target();
    if (target && target.node.releasePointerCapture) {
      target.node.releasePointerCapture(event.pointerId);
    }
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoom(event.clientX, event.clientY, event.deltaY, event);
  }
}

export class MultitouchTouch extends Multitouch {
  constructor() {
    super();
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchCancel = this.onTouchCancel.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  attach(surface: View): void {
    const target = this.target();
    if (target) {
      target.on("touchstart", this.onTouchStart, {passive: true});
    }
  }

  detach(surface: View): void {
    const target = this.target();
    if (target) {
      target.off("touchstart", this.onTouchStart);
    }
  }

  protected startTracking(surface: View): void {
    const target = this.target();
    if (target) {
      target.on("touchmove", this.onTouchMove, {passive: true});
      target.on("touchcancel", this.onTouchCancel);
      target.on("touchend", this.onTouchEnd);
    }
  }

  protected endTracking(surface: View): void {
    const target = this.target();
    if (target) {
      target.off("touchmove", this.onTouchMove);
      target.off("touchcancel", this.onTouchCancel);
      target.off("touchend", this.onTouchEnd);
    }
  }

  protected onTouchStart(event: TouchEvent): void {
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches[i];
      this.trackStart("" + touch.identifier, touch.clientX, touch.clientY, event);
    }
    if (event.changedTouches.length > 1 || this._trackCount > 1) {
      event.preventDefault();
    }
  }

  protected onTouchMove(event: TouchEvent): void {
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches[i];
      this.trackMove("" + touch.identifier, touch.clientX, touch.clientY, event);
    }
  }

  protected onTouchCancel(event: TouchEvent): void {
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches[i];
      this.trackCancel("" + touch.identifier, touch.clientX, touch.clientY, event);
    }
  }

  protected onTouchEnd(event: TouchEvent): void {
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches[i];
      this.trackEnd("" + touch.identifier, touch.clientX, touch.clientY, event);
    }
  }
}

export class MultitouchMouse extends Multitouch {
  protected _wheel: boolean;

  constructor() {
    super();
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this._wheel = true;
  }

  wheel(): boolean;
  wheel(wheel: boolean): this;
  wheel(wheel?: boolean): boolean | this {
    if (wheel === void 0) {
      return this._wheel;
    } else {
      if (this._wheel !== wheel) {
        this._wheel = wheel;
        const target = this.target();
        if (target) {
          if (wheel) {
            target.on("wheel", this.onWheel);
          } else {
            target.off("wheel", this.onWheel);
          }
        }
      }
      return this;
    }
  }

  attach(surface: View): void {
    const target = this.target();
    if (target) {
      target.on("mousedown", this.onMouseDown);
      if (this._wheel) {
        target.on("wheel", this.onWheel);
      }
    }
  }

  detach(surface: View): void {
    const target = this.target();
    if (target) {
      target.off("mousedown", this.onMouseDown);
      target.off("wheel", this.onWheel);
    }
  }

  protected startTracking(surface: View): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
  }

  protected endTracking(surface: View): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
  }

  protected onMouseDown(event: MouseEvent): void {
    this.trackStart("mouse", event.clientX, event.clientY, event);
  }

  protected onMouseMove(event: MouseEvent): void {
    this.trackMove("mouse", event.clientX, event.clientY, event);
  }

  protected onMouseUp(event: MouseEvent): void {
    this.trackEnd("mouse", event.clientX, event.clientY, event);
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoom(event.clientX, event.clientY, event.deltaY, event);
  }
}
