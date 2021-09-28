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

import type {Timing} from "@swim/util";
import {AnyLength, Length} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewContextType, ViewFlags, View, ViewAnimator} from "@swim/view";
import {Graphics, Icon, FilledIcon, IconViewAnimator, SvgIconView} from "@swim/graphics";
import {CellView} from "./CellView";
import type {IconCellViewObserver} from "./IconCellViewObserver";

export class IconCellView extends CellView {
  constructor(node: HTMLElement) {
    super(node);
    this.initSvg();
  }

  protected override initCell(): void {
    super.initCell();
    this.addClass("cell-icon");
  }

  override readonly viewObservers!: ReadonlyArray<IconCellViewObserver>;

  protected initSvg(): void {
    const svgView = this.createSvgView();
    if (svgView !== null) {
      this.setChildView("svg", svgView);
    }
  }

  protected createSvgView(): SvgIconView | null {
    return SvgIconView.create();
  }

  get svgView(): SvgIconView | null {
    const svgView = this.getChildView("svg");
    return svgView instanceof SvgIconView ? svgView : null;
  }

  @ViewAnimator({type: Number, state: 0.5, updateFlags: View.NeedsLayout})
  readonly xAlign!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, state: 0.5, updateFlags: View.NeedsLayout})
  readonly yAlign!: ViewAnimator<this, number>;

  @ViewAnimator({type: Length, state: null, updateFlags: View.NeedsLayout})
  readonly iconWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Length, state: null, updateFlags: View.NeedsLayout})
  readonly iconHeight!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Color, state: null, updateFlags: View.NeedsLayout})
  readonly iconColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  protected willSetGraphics(newGraphics: Graphics | null, oldGraphic: Graphics | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetGraphics !== void 0) {
        viewObserver.viewWillSetGraphics(newGraphics, oldGraphic, this);
      }
    }
  }

  protected onSetGraphics(newGraphics: Graphics | null, oldGraphic: Graphics | null): void {
    this.requireUpdate(View.NeedsRasterize | View.NeedsComposite);
  }

  protected didSetGraphics(newGraphics: Graphics | null, oldGraphic: Graphics | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetGraphics !== void 0) {
        viewObserver.viewDidSetGraphics(newGraphics, oldGraphic, this);
      }
    }
  }

  @ViewAnimator<IconCellView, Graphics | null>({
    extends: IconViewAnimator,
    type: Object,
    state: null,
    updateFlags: View.NeedsLayout,
    willSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.willSetGraphics(newGraphics, oldGraphics);
    },
    didSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.onSetGraphics(newGraphics, oldGraphics);
      this.owner.didSetGraphics(newGraphics, oldGraphics);
    },
  })
  readonly graphics!: ViewAnimator<this, Graphics | null>;

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (childView.key === "svg" && childView instanceof SvgIconView) {
      this.onInsertSvg(childView);
    }
  }

  protected onInsertSvg(svgView: SvgIconView): void {
    svgView.xAlign.setInherit(true);
    svgView.yAlign.setInherit(true);
    svgView.iconWidth.setInherit(true);
    svgView.iconHeight.setInherit(true);
    svgView.iconColor.setInherit(true);
    svgView.graphics.setInherit(true);
    svgView.setStyle("position", "absolute");
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (!this.graphics.isInherited()) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setOwnState(newGraphics, oldGraphics.isThemed() ? timing : false);
      }
    }
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.requireUpdate(View.NeedsLayout);
  }

  protected override onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    const iconColor = this.iconColor.takeUpdatedValue();
    if (iconColor !== void 0 && iconColor !== null) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof FilledIcon) {
        const newGraphics = oldGraphics.withFillColor(iconColor);
        this.graphics.setOwnState(newGraphics);
      }
    }
  }

  protected override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutIcon();
  }

  protected layoutIcon(): void {
    const svgView = this.svgView;
    if (svgView !== null && (svgView.width.takesPrecedence(View.Intrinsic)
                          || svgView.height.takesPrecedence(View.Intrinsic)
                          || svgView.viewBox.takesPrecedence(View.Intrinsic))) {
      let viewWidth: Length | number | null = this.width.value;
      viewWidth = viewWidth instanceof Length ? viewWidth.pxValue() : this.node.offsetWidth;
      let viewHeight: Length | number | null = this.height.value;
      viewHeight = viewHeight instanceof Length ? viewHeight.pxValue() : this.node.offsetHeight;
      svgView.width.setState(viewWidth, View.Intrinsic);
      svgView.height.setState(viewHeight, View.Intrinsic);
      svgView.viewBox.setState("0 0 " + viewWidth + " " + viewHeight, View.Intrinsic);
    }
  }
}
