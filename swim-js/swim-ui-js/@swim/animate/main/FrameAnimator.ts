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

import {Animator} from "./Animator";

export abstract class FrameAnimator extends Animator {
  /** @hidden */
  protected _animationFrame: number;
  /** @hidden */
  _disabled: boolean;
  /** @hidden */
  _dirty: boolean;

  constructor() {
    super();
    this._animationFrame = 0;
    this._disabled = false;
    this._dirty = false;
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

  animate(): void {
    if (!this._animationFrame && !this._disabled) {
      if (!this.hasOwnProperty("onAnimationFrame")) {
        this.onAnimationFrame = this.onAnimationFrame.bind(this);
      }
      this._animationFrame = requestAnimationFrame(this.onAnimationFrame);
    }
  }

  cancel(): void {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = 0;
    }
  }

  protected onAnimationFrame(timestamp: number): void {
    this._animationFrame = 0;
    this.onFrame(timestamp);
  }
}
