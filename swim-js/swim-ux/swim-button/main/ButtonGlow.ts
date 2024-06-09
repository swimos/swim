// Copyright 2015-2024 Nstream, inc.
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
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import {Affinity} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {Look} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {HtmlView} from "@swim/dom";

/** @public */
export type ButtonGlowState = "ready" | "glowing" | "pulsing" | "fading";

/** @public */
export class ButtonGlow extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.glowState = "ready";
    this.glowTimer = 0;
    this.initGlow();
  }

  protected initGlow(): void {
    this.setIntrinsic<ButtonGlow>({
      classList: ["button-glow"],
      style: {
        position: "absolute",
        width: Length.zero(),
        height: Length.zero(),
        borderRadius: Length.pct(50),
        pointerEvents: "none",
      },
    });
  }

  readonly glowState: ButtonGlowState;

  /** @internal */
  glowTimer: number;

  @Animator({
    inherits: true,
    get parent(): Animator<any, Length | null, any> {
      return this.owner.style.left;
    },
    didTransition(): void {
      this.owner.didGlow();
    },
  })
  readonly left!: Animator<this, Length | null>;

  @Animator({
    inherits: true,
    get parent(): Animator<any, number | undefined, any> {
      return this.owner.style.opacity;
    },
    didTransition(opacity: number | undefined): void {
      if (this.owner.glowState === "pulsing" && opacity === 0) {
        this.owner.didPulse();
      } else if (this.owner.glowState === "fading" && opacity === 0) {
        this.owner.didFade();
      }
    },
  })
  readonly opacity!: Animator<this, number | undefined>;

  protected override didMount(): void {
    if (this.style.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
      let highlightColor = this.getLookOr(Look.highlightColor, null);
      if (highlightColor !== null) {
        highlightColor = highlightColor.alpha(1);
      }
      this.style.backgroundColor.setIntrinsic(highlightColor);
    }
    super.didMount();
  }

  protected override onUnmount(): void {
    (this as Mutable<this>).glowState = "ready";
    this.cancelGlow();
    this.remove();
    super.onUnmount();
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.style.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
      let highlightColor = theme.getOr(Look.highlightColor, mood, null);
      if (highlightColor !== null) {
        highlightColor = highlightColor.alpha(1);
      }
      this.style.backgroundColor.setIntrinsic(highlightColor);
    }
  }

  glow(clientX: number, clientY: number, timing?: TimingLike | boolean, delay: number = 0): void {
    if (this.glowState !== "ready") {
      return;
    }
    this.cancelGlow();
    if (delay !== 0) {
      const glow = this.glow.bind(this, clientX, clientY, timing, 0);
      this.glowTimer = setTimeout(glow, delay) as any;
      return;
    } else if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    this.willGlow();
    const offsetParent = this.node.offsetParent;
    if (offsetParent === null) {
      return;
    }
    const clientBounds = offsetParent.getBoundingClientRect();
    const cx = clientX - clientBounds.left;
    const cy = clientY - clientBounds.top;
    const rx = Math.max(cx, clientBounds.width - cx);
    const ry = Math.max(cy, clientBounds.height - cy);
    const r = Math.sqrt(rx * rx + ry * ry);
    const highlightColor = this.getLook(Look.highlightColor);
    const opacity = highlightColor !== void 0 ? highlightColor.alpha() : 0.1;
    this.style.opacity.setIntrinsic(opacity);
    if (timing !== false) {
      this.style.setIntrinsic({
        left: cx,
        top: cy,
      });
      this.style.setIntrinsic({
        left: cx - r,
        top: cy - r,
        width: 2 * r,
        height: 2 * r,
      }, timing);
    } else {
      this.style.setIntrinsic({
        left: cx - r,
        top: cy - r,
        width: 2 * r,
        height: 2 * r,
      });
      this.didGlow();
    }
    (this as Mutable<this>).glowState = "glowing";
  }

  protected willGlow(): void {
    // hook
  }

  protected didGlow(): void {
    // hook
  }

  cancelGlow(): void {
    if (this.glowTimer !== 0) {
      clearTimeout(this.glowTimer);
      this.glowTimer = 0;
    }
  }

  pulse(clientX: number, clientY: number, timing?: TimingLike | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    if (this.glowState === "ready") {
      this.glow(clientX, clientY, timing);
    }
    if (this.glowState === "glowing") {
      this.willPulse();
      if (timing !== false) {
        this.style.opacity.setIntrinsic(0, timing);
      } else {
        this.style.opacity.setIntrinsic(0);
        this.didPulse();
      }
      (this as Mutable<this>).glowState = "pulsing";
    }
  }

  protected willPulse(): void {
    // hook
  }

  protected didPulse(): void {
    this.remove();
  }

  fade(clientX: number, clientY: number, timing?: TimingLike | boolean): void {
    if (this.glowState === "ready") {
      this.cancelGlow();
      this.didFade();
    } else if (this.glowState === "glowing") {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromLike(timing);
      }
      this.willFade();
      if (timing !== false) {
        this.style.opacity.setIntrinsic(0, timing);
      } else {
        this.style.opacity.setIntrinsic(0);
        this.didFade();
      }
    }
    (this as Mutable<this>).glowState = "fading";
  }

  protected willFade(): void {
    // hook
  }

  protected didFade(): void {
    this.remove();
  }
}
