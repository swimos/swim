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

import {Objects, Iterator, Cursor} from "@swim/util";
import {Inlet, Outlet, Inoutlet} from "@swim/streamlet";
import {MapValueFunction, MapValueCombinator} from "@swim/streamlet";
import {WatchValueFunction, WatchValueCombinator} from "@swim/streamlet";
import {Interpolator} from "@swim/interpolate";
import {AnyEase, Ease, Tween, AnyTransition, Transition} from "@swim/transition";
import {TransitionStart, TransitionEnd, TransitionInterrupt} from "@swim/transition";
import {Animator} from "./Animator";

/** @hidden */
export const enum TweenState {
  Quiesced,
  Diverged,
  Tracking,
  Converged,
  Interrupt,
}

export abstract class TweenAnimator<T> extends Animator implements Inoutlet<T, T> {
  /** @hidden */
  _duration: number;
  /** @hidden */
  _ease: Ease;
  /** @hidden */
  _interpolator: Interpolator<T> | null;
  /** @hidden */
  _onStart: TransitionStart<T> | null;
  /** @hidden */
  _onEnd: TransitionEnd<T> | null;
  /** @hidden */
  _onInterrupt: TransitionInterrupt<T> | null;
  /** @hidden */
  _interrupt: TransitionInterrupt<T> | null;
  /** @hidden */
  _value: T | null | undefined;
  /** @hidden */
  _state: T | null | undefined;
  /** @hidden */
  _startTime: number;
  /** @hidden */
  _tweenState: TweenState;
  /** @hidden */
  _disabled: boolean;
  /** @hidden */
  _dirty: boolean;
  /** @hidden */
  protected _input: Outlet<T> | null;
  /** @hidden */
  protected _outputs: ReadonlyArray<Inlet<T>> | null;
  /** @hidden */
  protected _version: number;

  constructor(value: T | null | undefined, transition: Transition<T> | null) {
    super();
    if (transition) {
      this._duration = transition._duration !== null ? transition._duration : 0;
      this._ease = transition._ease !== null ? transition._ease : Ease.linear;
      this._interpolator = transition._interpolator;
      this._onStart = transition._onStart;
      this._onEnd = transition._onEnd;
      this._onInterrupt = transition._onInterrupt;
    } else {
      this._duration = 0;
      this._ease = Ease.linear;
      this._interpolator = null;
      this._onStart = null;
      this._onEnd = null;
      this._onInterrupt = null;
    }
    this._interrupt = null;
    this._value = value;
    this._state = value;
    this._startTime = 0;
    this._tweenState = TweenState.Quiesced;
    this._disabled = false;
    this._dirty = false;
    this._input = null;
    this._outputs = null;
    this._version = -1;
  }

  get enabled(): boolean {
    return !this._disabled;
  }

  setEnabled(enabled: boolean): void {
    if (enabled && this._disabled) {
      this._disabled = false;
      this.didSetEnabled(false);
    } else if (!enabled && !this._disabled) {
      this._disabled = true;
      this.didSetEnabled(true);
    }
  }

  protected didSetEnabled(enabled: boolean): void {
    if (enabled) {
      this.animate();
    } else {
      this.cancel();
    }
  }

  get dirty(): boolean {
    return this._dirty;
  }

  setDirty(dirty: boolean): void {
    if (dirty && !this._dirty) {
      this._dirty = true;
      this.didSetDirty(true);
    } else if (!dirty && this._dirty) {
      this._dirty = false;
      this.didSetDirty(false);
    }
  }

  protected didSetDirty(dirty: boolean): void {
    // stub
  }

  abstract cancel(): void;

  duration(): number;
  duration(duration: number): this;
  duration(duration?: number): number | this {
    if (duration === void 0) {
      return this._duration;
    } else {
      this._duration = Math.max(0, duration);
      return this;
    }
  }

  ease(): Ease;
  ease(ease: AnyEase): this;
  ease(ease?: AnyEase): Ease | this {
    if (ease === void 0) {
      return this._ease;
    } else {
      this._ease = Ease.fromAny(ease);
      return this;
    }
  }

  interpolator(): Interpolator<T> | null;
  interpolator(interpolator: Interpolator<T> | null): this;
  interpolator(a: T | null | undefined, b: T | null | undefined): this;
  interpolator(a?: Interpolator<T> | null | T, b?: T): Interpolator<T> | null | this {
    if (a === void 0) {
      return this._interpolator;
    } else {
      if (arguments.length === 1) {
        this._interpolator = a as Interpolator<T> | null;
      } else {
        if (this._interpolator !== null && a !== null && a !== void 0) {
          this._interpolator = this._interpolator.range(a as T, b);
        } else {
          this._interpolator = Interpolator.from(a as T | null | undefined, b);
        }
      }
      return this;
    }
  }

  transition(): Transition<T>;
  transition(transition: AnyTransition<T>): this;
  transition(transition?: AnyTransition<T>): Transition<T> | this {
    if (transition === void 0) {
      return new Transition(this._duration, this._ease, this._interpolator, null, null, null);
    } else {
      transition = Transition.fromAny(transition);
      if (transition._duration !== null) {
        this._duration = transition._duration;
      }
      if (transition._ease !== null) {
        this._ease = transition._ease;
      }
      if (transition._interpolator !== null) {
        this._interpolator = transition._interpolator;
      }
      this._onStart = transition._onStart;
      this._onEnd = transition._onEnd;
      this._onInterrupt = transition._onInterrupt;
      return this;
    }
  }

  get value(): T | null | undefined {
    return this._value;
  }

  get state(): T | null | undefined {
    return this._state;
  }

  setState(state: T | null | undefined, tween?: Tween<T>): void {
    const interrupt = this._onInterrupt; // get current transition interrupt callback
    this._onInterrupt = null;
    if (tween instanceof Transition || typeof tween === "object" && tween) {
      this.transition(tween); // may update transition interrupt callback
    } else if (!tween) {
      this._duration = 0;
      this._onStart = null;
      this._onEnd = null;
      this._onInterrupt = null;
      this.cancel();
    }
    this._interrupt = interrupt; // stash current transition interrupt callback

    if (state !== null && state !== void 0) {
      if (this._tweenState === TweenState.Quiesced && Objects.equal(this._state, state)) {
        // nop
      } else {
        this.interpolator(this.value, state);
        this._state = state;
        this._startTime = 0;
        if (this._tweenState === TweenState.Tracking) {
          this._tweenState = TweenState.Interrupt;
        } else {
          this._tweenState = TweenState.Diverged;
        }
        if (tween) {
          this.animate();
        } else {
          this.onFrame(0);
        }
      }
    } else {
      this._state = state;
      this._startTime = 0;
      if (this._tweenState === TweenState.Tracking) {
        this.onInterrupt(this._value!);
        const interruptCallback = this._interrupt;
        if (interruptCallback) {
          this._interrupt = null;
          interruptCallback(this._value!); // invoke last transition interrupt callback
        }
      }
      this._tweenState = TweenState.Quiesced;
      this._value = state;
      if (this._value === void 0) {
        this._interpolator = null;
        this.delete();
      }
    }
  }

  onFrame(t: number): void {
    if (this._tweenState === TweenState.Quiesced || this._disabled) {
      return;
    }

    if (this._tweenState === TweenState.Interrupt) {
      this.onInterrupt(this._value!);
      const interruptCallback = this._interrupt;
      if (interruptCallback) {
        this._interrupt = null;
        interruptCallback(this._value!); // invoke last transition interrupt callback
      }
      this._tweenState = TweenState.Diverged;
    }

    if (this._tweenState === TweenState.Diverged) {
      if (!Objects.equal(this._value, this._state)) {
        this._startTime = t;
        this.onStart(this._value!);
        const startCallback = this._onStart;
        if (startCallback) {
          this._onStart = null;
          startCallback(this._value!); // invoke transition start callback
        }
        this._tweenState = TweenState.Tracking;
      } else {
        this.tween(1);
      }
    }

    if (this._tweenState === TweenState.Tracking) {
      const u = this._duration ? Math.min(Math.max(0, (t - this._startTime) / this._duration), 1) : 1;
      this.tween(u);
    }

    if (this._tweenState === TweenState.Converged) {
      this._onInterrupt = null;
      this._startTime = 0;
      this._tweenState = TweenState.Quiesced;
      this.onEnd(this._value!);
      const endCallback = this._onEnd;
      if (endCallback) {
        this._onEnd = null;
        endCallback(this._value!); // invoke transition end callback
      }
    } else {
      this.animate();
    }
  }

  interpolate(u: number): T {
    return this._interpolator ? this._interpolator.interpolate(u) : this._state!;
  }

  tween(u: number): void {
    u = this._ease(u);
    const oldValue = this._value!;
    const newValue = this.interpolate(u);
    this._value = newValue;
    this.update(newValue, oldValue);
    if (u === 1) {
      this._tweenState = TweenState.Converged;
    }
  }

  abstract update(newValue: T, oldValue: T): void;

  abstract delete(): void;

  protected onStart(value: T): void {
    // stub
  }

  protected onEnd(value: T): void {
    // stub
  }

  protected onInterrupt(value: T): void {
    // stub
  }

  get(): T | undefined {
    let state = this.state;
    if (state === null) {
      state = void 0;
    }
    return state;
  }

  input(): Outlet<T> | null {
    return this._input;
  }

  bindInput(input: Outlet<T> | null): void {
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = input;
    if (this._input !== null) {
      this._input.bindOutput(this);
    }
  }

  unbindInput(): void {
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = null;
  }

  disconnectInputs(): void {
    if (this._outputs === null) {
      const input = this._input;
      if (input !== null) {
        input.unbindOutput(this);
        this._input = null;
        input.disconnectInputs();
      }
    }
  }

  outputIterator(): Iterator<Inlet<T>> {
    return this._outputs !== null ? Cursor.array(this._outputs) : Cursor.empty();
  }

  bindOutput(output: Inlet<T>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    const newOutputs = new Array<Inlet<T>>(n + 1);
    for (let i = 0; i < n; i += 1) {
      newOutputs[i] = oldOutputs![i];
    }
    newOutputs[n] = output;
    this._outputs = newOutputs;
  }

  unbindOutput(output: Inlet<T>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    for (let i = 0; i < n; i += 1) {
      if (oldOutputs![i] === output) {
        if (n > 1) {
          const newOutputs = new Array<Inlet<T>>(n - 1);
          for (let j = 0; j < i; j += 1) {
            newOutputs[j] = oldOutputs![j];
          }
          for (let j = i; j < n - 1; j += 1) {
            newOutputs[j] = oldOutputs![j + 1];
          }
          this._outputs = newOutputs;
        } else {
          this._outputs = null;
        }
        break;
      }
    }
  }

  unbindOutputs(): void {
    const outputs = this._outputs;
    if (outputs !== null) {
      this._outputs = null;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i];
        output.unbindInput();
      }
    }
  }

  disconnectOutputs(): void {
    if (this._input === null) {
      const outputs = this._outputs;
      if (outputs !== null) {
        this._outputs = null;
        for (let i = 0, n = outputs.length; i < n; i += 1) {
          const output = outputs[i];
          output.unbindInput();
          output.disconnectOutputs();
        }
      }
    }
  }

  invalidateOutput(): void {
    this.invalidate();
  }

  invalidateInput(): void {
    this.invalidate();
  }

  invalidate(): void {
    if (this._version >= 0) {
      this.willInvalidate();
      this._version = -1;
      this.onInvalidate();
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        this._outputs![i].invalidateOutput();
      }
      this.didInvalidate();
    }
  }

  reconcileOutput(version: number): void {
    this.reconcile(version);
  }

  reconcileInput(version: number): void {
    this.reconcile(version);
  }

  reconcile(version: number): void {
    if (this._version < 0) {
      this.willReconcile(version);
      this._version = version;
      if (this._input !== null) {
        this._input.reconcileInput(version);
      }
      this.onReconcile(version);
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        this._outputs![i].reconcileOutput(version);
      }
      this.didReconcile(version);
    }
  }

  protected willInvalidate(): void {
    // stub
  }

  protected onInvalidate(): void {
    // stub
  }

  protected didInvalidate(): void {
    // stub
  }

  protected willReconcile(version: number): void {
    // stub
  }

  protected onReconcile(version: number): void {
    if (this._input !== null) {
      const value = this._input.get();
      if (value !== void 0) {
        this.setState(value, true);
      }
    }
  }

  protected didReconcile(version: number): void {
    // stub
  }

  memoize(): Outlet<T> {
    return this;
  }

  map<T2>(func: MapValueFunction<T, T2>): Outlet<T2> {
    const combinator = new MapValueCombinator<T, T2>(func);
    combinator.bindInput(this);
    return combinator;
  }

  watch(func: WatchValueFunction<T>): this {
    const combinator = new WatchValueCombinator<T>(func);
    combinator.bindInput(this);
    return this;
  }
}
