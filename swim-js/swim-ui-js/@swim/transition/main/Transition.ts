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

import {Objects} from "@swim/util";
import {Form} from "@swim/structure";
import {AnyInterpolator, Interpolator} from "@swim/interpolate";
import {AnyEase, Ease} from "./Ease";
import {TransitionForm} from "./TransitionForm";

export type TransitionStart<T> = (value: T) => void;
export type TransitionEnd<T> = (value: T) => void;
export type TransitionInterrupt<T> = (value: T) => void;

export type Tween<T> = AnyTransition<T> | boolean;

export type AnyTransition<T> = Transition<T> | TransitionInit<T>;

export interface TransitionInit<T> {
  duration?: number | null;
  ease?: AnyEase | null;
  interpolator?: AnyInterpolator<T> | null;
  onStart?: TransitionStart<T> | null;
  onEnd?: TransitionEnd<T> | null;
  onInterrupt?: TransitionInterrupt<T> | null;
}

export class Transition<T> {
  /** @hidden */
  readonly _duration: number | null;
  /** @hidden */
  readonly _ease: Ease | null;
  /** @hidden */
  readonly _interpolator: Interpolator<T> | null;
  /** @hidden */
  readonly _onStart: TransitionStart<T> | null;
  /** @hidden */
  readonly _onEnd: TransitionEnd<T> | null;
  /** @hidden */
  readonly _onInterrupt: TransitionInterrupt<T> | null;

  constructor(duration: number | null, ease: Ease | null, interpolator: Interpolator<T> | null,
              onStart: TransitionStart<T> | null, onEnd: TransitionEnd<T> | null,
              onInterrupt: TransitionInterrupt<T> | null) {
    this._duration = duration;
    this._ease = ease;
    this._interpolator = interpolator;
    this._onStart = onStart;
    this._onEnd = onEnd;
    this._onInterrupt = onInterrupt;
  }

  duration(): number | null;
  duration(duration: number | null): Transition<T>;
  duration(duration?: number | null): number | null | Transition<T> {
    if (duration === void 0) {
      return this._duration;
    } else {
      return new Transition(duration, this._ease, this._interpolator,
                            this._onStart, this._onEnd, this._onInterrupt);
    }
  }

  ease(): Ease | null;
  ease(ease: AnyEase | null): Transition<T>;
  ease(ease?: AnyEase | null): Ease | null | Transition<T> {
    if (ease === void 0) {
      return this._ease;
    } else {
      ease = ease !== null ? Ease.fromAny(ease) : null;
      return new Transition(this._duration, ease, this._interpolator,
                            this._onStart, this._onEnd, this._onInterrupt);
    }
  }

  interpolator(): Interpolator<T> | null;
  interpolator(interpolator: AnyInterpolator<T> | null): Transition<T>;
  interpolator(interpolator?: AnyInterpolator<T> | null): Interpolator<T> | null | Transition<T> {
    if (interpolator === void 0) {
      return this._interpolator;
    } else {
      interpolator = interpolator !== null ? Interpolator.fromAny(interpolator) : null;
      return new Transition(this._duration, this._ease, interpolator,
                            this._onStart, this._onEnd, this._onInterrupt);
    }
  }

  range(): T[] | null;
  range(ys: ReadonlyArray<T>): Transition<T>;
  range(y0: T, y1?: T): Transition<T>;
  range(y0?: ReadonlyArray<T> | T, y1?: T): T[] | null | Transition<T> {
    if (y0 === void 0) {
      return this._interpolator ? this._interpolator.range() : null;
    } else {
      let interpolator: Interpolator<T>;
      if (this._interpolator) {
        interpolator = this._interpolator.range(y0 as T, y1);
      } else {
        interpolator = Interpolator.from(y0 as T, y1);
      }
      return new Transition(this._duration, this._ease, interpolator,
                            this._onStart, this._onEnd, this._onInterrupt);
    }
  }

  onStart(): TransitionStart<T> | null;
  onStart(onStart: TransitionStart<T> | null): Transition<T>;
  onStart(onStart?: TransitionStart<T> | null): TransitionStart<T> | null | Transition<T> {
    if (onStart === void 0) {
      return this._onStart;
    } else {
      return new Transition(this._duration, this._ease, this._interpolator,
                            onStart, this._onEnd, this._onInterrupt);
    }
  }

  onEnd(): TransitionEnd<T> | null;
  onEnd(onEnd: TransitionEnd<T> | null): Transition<T>;
  onEnd(onEnd?: TransitionEnd<T> | null): TransitionEnd<T> | null | Transition<T> {
    if (onEnd === void 0) {
      return this._onEnd;
    } else {
      return new Transition(this._duration, this._ease, this._interpolator,
                            this._onStart, onEnd, this._onInterrupt);
    }
  }

  onInterrupt(): TransitionInterrupt<T> | null;
  onInterrupt(onInterrupt: TransitionInterrupt<T> | null): Transition<T>;
  onInterrupt(onInterrupt?: TransitionInterrupt<T> | null): TransitionInterrupt<T> | null | Transition<T> {
    if (onInterrupt === void 0) {
      return this._onInterrupt;
    } else {
      return new Transition(this._duration, this._ease, this._interpolator,
                            this._onStart, this._onEnd, onInterrupt);
    }
  }

  toAny(): TransitionInit<T> {
    const init: TransitionInit<T> = {};
    if (this._duration !== null) {
      init.duration = this._duration;
    }
    if (this._ease !== null) {
      init.ease = this._ease;
    }
    if (this._interpolator !== null) {
      init.interpolator = this._interpolator;
    }
    if (this._onStart !== null) {
      init.onStart = this._onStart;
    }
    if (this._onEnd !== null) {
      init.onEnd = this._onEnd;
    }
    if (this._onInterrupt !== null) {
      init.onInterrupt = this._onInterrupt;
    }
    return init;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Transition) {
      return this._duration === that._duration && this._ease === that._ease
          && Objects.equal(this._interpolator, that._interpolator);
    }
    return false;
  }

  static duration<T>(duration: number, ease: AnyEase | null = null,
                     interpolator: AnyInterpolator<T> | null = null): Transition<T> {
    ease = ease !== null ? Ease.fromAny(ease) : null;
    interpolator = interpolator !== null ? Interpolator.fromAny(interpolator) : null;
    return new Transition(duration, ease, interpolator, null, null, null);
  }

  static ease<T>(ease: AnyEase, interpolator: AnyInterpolator<T> | null = null): Transition<T> {
    ease = Ease.fromAny(ease);
    interpolator = interpolator !== null ? Interpolator.fromAny(interpolator) : null;
    return new Transition(null, ease, interpolator, null, null, null);
  }

  static interpolator<T>(interpolator: AnyInterpolator<T>): Transition<T> {
    interpolator = Interpolator.fromAny(interpolator);
    return new Transition(null, null, interpolator, null, null, null);
  }

  static range<T>(y0: ReadonlyArray<T>): Transition<T>;
  static range<T>(y0: T, y1?: T): Transition<T>;
  static range<T>(y0: ReadonlyArray<T> | T, y1?: T): Transition<T> {
    let interpolator: Interpolator<T>;
    if (y1 === void 0 && Array.isArray(y0)) {
      y0 = y0 as ReadonlyArray<T>;
      interpolator = Interpolator.from(y0[0], y0[1]);
    } else {
      interpolator = Interpolator.from(y0 as T, y1);
    }
    return new Transition(null, null, interpolator, null, null, null);
  }

  static from<T>(duration: number | null = null, ease: AnyEase | null = null,
                 interpolator: AnyInterpolator<T> | null = null,
                 onStart: TransitionStart<T> | null = null,
                 onEnd: TransitionEnd<T> | null = null,
                 onInterrupt: TransitionInterrupt<T> | null = null): Transition<T> {
    ease = ease !== null ? Ease.fromAny(ease) : null;
    interpolator = interpolator !== null ? Interpolator.fromAny(interpolator) : null;
    return new Transition(duration, ease, interpolator, onStart, onEnd, onInterrupt);
  }

  static fromAny<T>(tween: AnyTransition<T>): Transition<T>;
  static fromAny<T>(tween: Tween<T> | null | undefined, value: T, duration?: number | null,
                    ease?: AnyEase | null): Transition<T> | undefined;
  static fromAny<T>(tween: Tween<T> | null | undefined, value?: T, duration: number | null = null,
                    ease: AnyEase | null = null): Transition<T> | undefined {
    if (tween instanceof Transition) {
      return tween;
    } else if (typeof tween === "object" && tween) {
      return Transition.from(tween.duration, tween.ease, tween.interpolator,
                             tween.onStart, tween.onEnd, tween.onInterrupt);
    } else if (tween === true) {
      return Transition.from(duration, ease, Interpolator.from(value as T));
    } else {
      return void 0;
    }
  }

  /** @hidden */
  static isInit(value: unknown): value is TransitionInit<any> {
    if (value && typeof value === "object") {
      const init = value as TransitionInit<any>;
      return init.duration !== void 0 || init.ease !== void 0 || init.interpolator !== void 0;
    }
    return false;
  }

  private static _form: Form<Transition<any>, AnyTransition<any>>;
  static form<T>(interpolatorForm?: Form<Interpolator<T>, AnyInterpolator<T>>,
                 unit?: AnyTransition<T>): Form<Transition<T>, AnyTransition<T>> {
    if (interpolatorForm === void 0) {
      interpolatorForm = Transition.interpolatorForm();
    }
    if (interpolatorForm !== Transition.interpolatorForm() || unit !== void 0) {
      unit = unit !== void 0 ? Transition.fromAny(unit) : unit;
      return new Transition.Form(interpolatorForm, unit);
    } else {
      if (!Transition._form) {
        Transition._form = new Transition.Form(interpolatorForm);
      }
      return Transition._form;
    }
  }
  /** @hidden */
  static interpolatorForm(): Form<Interpolator<any>, AnyInterpolator<any>> {
    throw new Error(); // overridden by StyleForm
  }

  // Forward type declarations
  /** @hidden */
  static Form: typeof TransitionForm; // defined by TransitionForm
}
