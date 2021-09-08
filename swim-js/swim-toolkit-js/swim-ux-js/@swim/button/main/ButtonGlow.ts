// Copyright 2015-2021 Swim Inc.
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

import {AnyTiming, Timing} from "@swim/mapping";
import {AnyLength, Length} from "@swim/math";
import {Look, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import {StyleAnimator, StyleAnimatorConstraint, HtmlView} from "@swim/dom";

export type ButtonGlowState = "ready" | "glowing" | "pulsing" | "fading";

export class ButtonGlow extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    Object.defineProperty(this, "glowState", {
      value: "ready",
      enumerable: true,
      configurable: true,
    });
    this.glowTimer = 0;
    this.initGlow();
  }

  protected initGlow(): void {
    this.addClass("button-glow");
    this.position.setState("absolute", View.Intrinsic);
    this.width.setState(Length.zero(), View.Intrinsic);
    this.height.setState(Length.zero(), View.Intrinsic);
    this.borderTopLeftRadius.setState(Length.pct(50), View.Intrinsic);
    this.borderTopRightRadius.setState(Length.pct(50), View.Intrinsic);
    this.borderBottomLeftRadius.setState(Length.pct(50), View.Intrinsic);
    this.borderBottomRightRadius.setState(Length.pct(50), View.Intrinsic);
    this.pointerEvents.setState("none", View.Intrinsic);
  }

  readonly glowState!: ButtonGlowState;

  /** @hidden */
  glowTimer: number;

  @StyleAnimatorConstraint<ButtonGlow, Length | null, AnyLength | null>({
    propertyNames: "left",
    type: Length,
    state: null,
    get computedValue(): Length | null {
      const node = this.owner.node;
      return node instanceof HTMLElement ? Length.px(node.offsetLeft) : null;
    },
    onEnd(): void {
      this.owner.didGlow();
    },
  })
  override readonly left!: StyleAnimatorConstraint<this, Length | null, AnyLength | null>;

  @StyleAnimator<ButtonGlow, number | undefined>({
    propertyNames: "opacity",
    type: Number,
    onEnd(opacity: number | undefined): void {
      if (this.owner.glowState === "pulsing" && opacity === 0) {
        this.owner.didPulse();
      } else if (this.owner.glowState === "fading" && opacity === 0) {
        this.owner.didFade();
      }
    },
  })
  override readonly opacity!: StyleAnimator<this, number | undefined>;

  protected override didMount(): void {
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      let highlightColor = this.getLookOr(Look.highlightColor, null);
      if (highlightColor !== null) {
        highlightColor = highlightColor.alpha(1);
      }
      this.backgroundColor.setState(highlightColor, View.Intrinsic);
    }
    super.didMount();
  }

  protected override onUnmount(): void {
    Object.defineProperty(this, "glowState", {
      value: "ready",
      enumerable: true,
      configurable: true,
    });
    this.cancelGlow();
    this.remove();
    super.onUnmount();
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      let highlightColor = theme.getOr(Look.highlightColor, mood, null);
      if (highlightColor !== null) {
        highlightColor = highlightColor.alpha(1);
      }
      this.backgroundColor.setState(highlightColor, View.Intrinsic);
    }
  }

  glow(clientX: number, clientY: number, timing?: AnyTiming | boolean, delay: number = 0): void {
    if (this.glowState === "ready") {
      this.cancelGlow();
      if (delay !== 0) {
        const glow = this.glow.bind(this, clientX, clientY, timing, View.Intrinsic);
        this.glowTimer = setTimeout(glow, delay) as any;
      } else {
        if (timing === void 0 || timing === true) {
          timing = this.getLookOr(Look.timing, false);
        } else {
          timing = Timing.fromAny(timing);
        }
        this.willGlow();
        const offsetParent = this.node.offsetParent;
        if (offsetParent !== null) {
          const clientBounds = offsetParent.getBoundingClientRect();
          const cx = clientX - clientBounds.left;
          const cy = clientY - clientBounds.top;
          const rx = Math.max(cx, clientBounds.width - cx);
          const ry = Math.max(cy, clientBounds.height - cy);
          const r = Math.sqrt(rx * rx + ry * ry);
          const highlightColor = this.getLook(Look.highlightColor);
          const opacity = highlightColor !== void 0 ? highlightColor.alpha() : 0.1;
          this.opacity.setState(opacity, View.Intrinsic);
          if (timing !== false) {
            this.left.setState(cx, View.Intrinsic);
            this.top.setState(cy, View.Intrinsic);
            this.left.setState(cx - r, timing, View.Intrinsic);
            this.top.setState(cy - r, timing, View.Intrinsic);
            this.width.setState(2 * r, timing, View.Intrinsic);
            this.height.setState(2 * r, timing, View.Intrinsic);
          } else {
            this.left.setState(cx - r, View.Intrinsic);
            this.top.setState(cy - r, View.Intrinsic);
            this.width.setState(2 * r, View.Intrinsic);
            this.height.setState(2 * r, View.Intrinsic);
            this.didGlow();
          }
          Object.defineProperty(this, "glowState", {
            value: "glowing",
            enumerable: true,
            configurable: true,
          });
        }
      }
    }
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

  pulse(clientX: number, clientY: number, timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    if (this.glowState === "ready") {
      this.glow(clientX, clientY, timing);
    }
    if (this.glowState === "glowing") {
      this.willPulse();
      if (timing !== false) {
        this.opacity.setState(0, timing, View.Intrinsic);
      } else {
        this.opacity.setState(0, View.Intrinsic);
        this.didPulse();
      }
      Object.defineProperty(this, "glowState", {
        value: "pulsing",
        enumerable: true,
        configurable: true,
      });
    }
  }

  protected willPulse(): void {
    // hook
  }

  protected didPulse(): void {
    this.remove();
  }

  fade(clientX: number, clientY: number, timing?: AnyTiming | boolean): void {
    if (this.glowState === "ready") {
      this.cancelGlow();
      this.didFade()
    } else if (this.glowState === "glowing") {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.willFade();
      if (timing !== false) {
        this.opacity.setState(0, timing, View.Intrinsic);
      } else {
        this.opacity.setState(0, View.Intrinsic);
        this.didFade();
      }
    }
    Object.defineProperty(this, "glowState", {
      value: "fading",
      enumerable: true,
      configurable: true,
    });
  }

  protected willFade(): void {
    // hook
  }

  protected didFade(): void {
    this.remove();
  }
}
