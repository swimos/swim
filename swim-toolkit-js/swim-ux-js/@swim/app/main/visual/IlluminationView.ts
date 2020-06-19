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

import {Length} from "@swim/length";
import {Color} from "@swim/color";
import {Transition} from "@swim/transition";
import {HtmlView} from "@swim/view";

export type IlluminationState = "passivated" | "illuminated" | "stimulated" | "dissipated";

export class IlluminationView extends HtmlView {
  /** @hidden */
  _illuminationState: IlluminationState;
  /** @hidden */
  _illuminationTimer: number;

  constructor(node: HTMLElement) {
    super(node);
    this._illuminationState = "passivated";
    this._illuminationTimer = 0;
  }

  protected initNode(node: HTMLElement): void {
    this.addClass("illumination")
        .position("absolute")
        .width(Length.zero())
        .height(Length.zero())
        .borderRadius(Length.pct(50))
        .backgroundColor(Color.white())
        .pointerEvents("none");
  }

  get illuminationState(): IlluminationState {
    return this._illuminationState;
  }

  protected onUnmount(): void {
    this._illuminationState = "passivated";
    this.cancelIlluminate();
    super.onUnmount();
  }

  illuminate(clientX: number, clientY: number, opacity: number,
             transition: Transition<any> | null, delay: number = 0): void {
    if (this._illuminationState === "passivated") {
      this.cancelIlluminate();
      if (delay !== 0) {
        const illuminate = this.illuminate.bind(this, clientX, clientY, opacity, transition, 0);
        this._illuminationTimer = setTimeout(illuminate, delay) as any;
      } else {
        this.willIlluminate();
        const clientBounds = this._node.offsetParent!.getBoundingClientRect();
        const cx = clientX - clientBounds.left;
        const cy = clientY - clientBounds.top;
        const rx = Math.max(cx, clientBounds.width - cx);
        const ry = Math.max(cy, clientBounds.height - cy);
        const r = Math.sqrt(rx * rx + ry * ry);
        this.opacity(opacity);
        if (transition !== null) {
          this.left(cx)
              .top(cy)
              .left(cx - r, transition.onEnd(this.didIlluminate.bind(this)))
              .top(cy - r, transition)
              .width(2 * r, transition)
              .height(2 * r, transition);
        } else {
          this.left(cx - r)
              .top(cy - r)
              .width(2 * r)
              .height(2 * r);
          this.didIlluminate();
        }
        this._illuminationState = "illuminated";
      }
    }
  }

  protected willIlluminate(): void {
    // hook
  }

  protected didIlluminate(): void {
    // hook
  }

  cancelIlluminate(): void {
    if (this._illuminationTimer !== 0) {
      clearTimeout(this._illuminationTimer);
      this._illuminationTimer = 0;
    }
  }

  stimulate(clientX: number, clientY: number, opacity: number, transition: Transition<any> | null): void {
    if (this._illuminationState === "passivated") {
      this.illuminate(clientX, clientY, opacity, transition);
    }
    if (this._illuminationState === "illuminated") {
      this.willStimulate();
      if (transition !== null) {
        this.opacity(0, transition.onEnd(this.didStimulate.bind(this)));
      } else {
        this.opacity(0);
        this.didStimulate();
      }
      this._illuminationState = "stimulated";
    }
  }

  protected willStimulate(): void {
    // hook
  }

  protected didStimulate(): void {
    this.remove();
  }

  dissipate(clientX: number, clientY: number, transition: Transition<any> | null): void {
    if (this._illuminationState === "passivated") {
      this.cancelIlluminate();
      this.didDissipate()
    } else if (this._illuminationState === "illuminated") {
      this.willDissipate();
      if (transition !== null) {
        this.opacity(0, transition.onEnd(this.didDissipate.bind(this)));
      } else {
        this.opacity(0);
        this.didDissipate();
      }
    }
    this._illuminationState = "dissipated";
  }

  protected willDissipate(): void {
    // hook
  }

  protected didDissipate(): void {
    this.remove();
  }
}
