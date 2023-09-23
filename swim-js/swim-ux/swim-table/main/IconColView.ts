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

import type {Class} from "@swim/util";
import type {Timing} from "@swim/util";
import {Affinity} from "@swim/component";
import {Animator} from "@swim/component";
import {Color} from "@swim/style";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {Graphics} from "@swim/graphics";
import {IconLayout} from "@swim/graphics";
import {Icon} from "@swim/graphics";
import type {IconView} from "@swim/graphics";
import {IconGraphicsAnimator} from "@swim/graphics";
import {SvgIconView} from "@swim/graphics";
import type {ColViewObserver} from "./ColView";
import {ColView} from "./ColView";

/** @public */
export interface IconColViewObserver<V extends IconColView = IconColView> extends ColViewObserver<V> {
  viewDidSetGraphics?(graphics: Graphics | null, view: V): void;
}

/** @public */
export class IconColView extends ColView implements IconView {
  protected override initCol(): void {
    super.initCol();
    this.classList.add("col-icon");
  }

  declare readonly observerType?: Class<IconColViewObserver>;

  /** @override */
  @Animator({valueType: IconLayout, value: null, updateFlags: View.NeedsLayout})
  readonly iconLayout!: Animator<this, IconLayout | null>;

  @ThemeAnimator({
    valueType: Color,
    value: null,
    updateFlags: View.NeedsLayout,
    didSetState(iconColor: Color | null): void {
      const timing = this.timing !== null ? this.timing : false;
      this.owner.graphics.setState(this.owner.graphics.state, timing, Affinity.Reflexive);
    },
  })
  get iconColor(): ThemeAnimator<this, Color | null> {
    return ThemeAnimator.getter();
  }

  @ThemeAnimator({
    extends: IconGraphicsAnimator,
    valueType: Graphics,
    value: null,
    updateFlags: View.NeedsLayout,
    didSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.callObservers("viewDidSetGraphics", newGraphics, this.owner);
    },
  })
  readonly graphics!: ThemeAnimator<this, Graphics | null>;

  @ViewRef({
    viewType: SvgIconView,
    viewKey: true,
    binds: true,
    init(): void {
      this.insertView();
    },
    initView(svgView: SvgIconView): void {
      svgView.style.position.set("absolute");
      svgView.iconLayout.setInherits(true);
      svgView.iconColor.setInherits(true);
      svgView.graphics.setInherits(true);
    },
  })
  readonly svg!: ViewRef<this, SvgIconView>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (!this.graphics.derived) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setState(newGraphics, oldGraphics.isThemed() ? timing : false, Affinity.Reflexive);
      }
    }
  }

  protected override onResize(): void {
    super.onResize();
    this.requireUpdate(View.NeedsLayout);
  }

  protected override needsDisplay(displayFlags: ViewFlags): ViewFlags {
    if ((this.flags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(): void {
    super.onLayout();
    this.layoutIcon();
  }

  protected layoutIcon(): void {
    const svgView = this.svg.view;
    if (svgView === null || !svgView.attributes.width.hasAffinity(Affinity.Intrinsic)
                         && !svgView.attributes.height.hasAffinity(Affinity.Intrinsic)
                         && !svgView.attributes.viewBox.hasAffinity(Affinity.Intrinsic)) {
      return;
    }
    const width = this.style.width.pxValue();
    const height = this.style.height.pxValue();
    svgView.attributes.setIntrinsic({
      width, height,
      viewBox: "0 0 " + width + " " + height,
    });
  }
}
