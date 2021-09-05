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
import {Look, Feel, MoodVector, ThemeMatrix} from "@swim/theme";
import {
  ViewContextType,
  View,
  ViewEdgeInsets,
  ViewProperty,
  ViewAnimator,
  ViewFastener,
  PositionGestureInput,
  PositionGestureDelegate,
} from "@swim/view";
import {Height, HtmlView} from "@swim/dom";
import {Graphics, HtmlIconView} from "@swim/graphics";
import {ButtonMembrane} from "@swim/button";
import type {ListItemObserver} from "./ListItemObserver";
import {ListView} from "./ListView";

export class ListItem extends ButtonMembrane implements PositionGestureDelegate {
  constructor(node: HTMLElement) {
    super(node);
    this.onClick = this.onClick.bind(this);
    this.initListItem();
  }

  protected initListItem(): void {
    this.addClass("list-item");
    this.position.setState("relative", View.Intrinsic);
    this.display.setState("flex", View.Intrinsic);
    this.flexShrink.setState(0, View.Intrinsic);
    this.height.setState(44, View.Intrinsic);
    this.boxSizing.setState("border-box", View.Intrinsic);
    this.lineHeight.setState(this.height.state, View.Intrinsic);
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
    this.cursor.setState("pointer", View.Intrinsic);
    this.userSelect.setState("none", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<ListItemObserver>;

  @ViewProperty({type: Boolean, state: false})
  readonly highlighted!: ViewProperty<this, boolean>;

  @ViewProperty({type: Object, inherit: true, state: null})
  readonly edgeInsets!: ViewProperty<this, ViewEdgeInsets | null>;

  @ViewAnimator({type: Length, inherit: true, state: null})
  readonly collapsedWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Number, inherit: true, updateFlags: View.NeedsAnimate})
  readonly drawerStretch!: ViewAnimator<this, number | undefined>; // 0 = collapsed; 1 = expanded

  @ViewFastener<ListItem, HtmlView, Graphics>({
    key: true,
    type: HtmlView,
    onSetView(iconView: HtmlView | null): void {
      if (iconView !== null) {
        this.owner.initIconView(iconView);
      }
    },
    createView(): HtmlView | null {
      return this.owner.createIconView();
    },
    insertView(parentView: View, childView: HtmlView, targetView: View | null, key: string | undefined): void {
      parentView.prependChildView(childView, key);
    },
    fromAny(value: HtmlView | Graphics): HtmlView | null {
      if (value instanceof HtmlView) {
        return value;
      } else {
        const iconView = this.owner.createIconView();
        iconView.graphics.setState(value, View.Intrinsic);
        return iconView;
      }
    },
  })
  readonly icon!: ViewFastener<ListItem, HtmlView, Graphics>;

  protected createIconView(): HtmlIconView {
    return HtmlIconView.create();
  }

  protected initIconView(iconView: HtmlView): void {
    iconView.flexShrink.setState(0, View.Intrinsic);
    iconView.width.setState(this.collapsedWidth.getStateOr(ListItem.DefaultCollapsedWidth), View.Intrinsic);
    iconView.height.setState(this.height.state, View.Intrinsic);
    if (iconView instanceof HtmlIconView) {
      iconView.iconWidth.setState(24, View.Intrinsic);
      iconView.iconHeight.setState(24, View.Intrinsic);
      iconView.iconColor.setState(this.getLookOr(Look.mutedColor, null));
    }
  }

  @ViewFastener<ListItem, HtmlView, string | undefined>({
    key: true,
    type: HtmlView,
    onSetView(labelView: HtmlView | null): void {
      if (labelView !== null) {
        this.owner.initLabelView(labelView);
      }
    },
    createView(): HtmlView | null {
      return this.owner.createLabelView();
    },
    insertView(parentView: View, childView: HtmlView, targetView: View | null, key: string | undefined): void {
      targetView = this.owner.accessory.view;
      parentView.insertChildView(childView, targetView, key);
    },
    fromAny(value: HtmlView | string | undefined): HtmlView | null {
      if (value instanceof HtmlView) {
        return value;
      } else if (typeof value === "string") {
        const labelView = this.owner.createLabelView();
        labelView.text(value);
        return labelView;
      } else {
        return null;
      }
    },
  })
  readonly label!: ViewFastener<ListItem, HtmlView, string | undefined>;

  protected createLabelView(): HtmlView {
    const labelView = HtmlView.span.create();
    labelView.display.setState("block", View.Intrinsic);
    labelView.fontFamily.setState("system-ui, 'Open Sans', sans-serif", View.Intrinsic);
    labelView.fontSize.setState(17, View.Intrinsic);
    labelView.whiteSpace.setState("nowrap", View.Intrinsic);
    labelView.textOverflow.setState("ellipsis", View.Intrinsic);
    labelView.overflowX.setState("hidden", View.Intrinsic);
    labelView.overflowY.setState("hidden", View.Intrinsic);
    return labelView;
  }

  protected initLabelView(labelView: HtmlView): void {
    labelView.flexGrow.setState(1, View.Intrinsic);
    labelView.flexShrink.setState(0, View.Intrinsic);
    if (labelView.color.takesPrecedence(View.Intrinsic)) {
      const itemColor = this.getLookOr(this.highlighted.state ? Look.color : Look.mutedColor, null);
      labelView.color.setState(itemColor, View.Intrinsic);
    }
  }

  @ViewFastener<ListItem, HtmlView, Graphics | string>({
    key: true,
    type: HtmlView,
    onSetView(accessoryView: HtmlView | null): void {
      if (accessoryView !== null) {
        this.owner.initAccessoryView(accessoryView);
      }
    },
    createView(): HtmlView | null {
      return this.owner.createAccessoryView();
    },
    insertView(parentView: View, childView: HtmlView, targetView: View | null, key: string | undefined): void {
      parentView.appendChildView(childView, key);
    },
    fromAny(value: HtmlView | Graphics | string): HtmlView | null {
      if (value instanceof HtmlView) {
        return value;
      } else if (typeof value === "string") {
        const accessoryView = this.owner.createAccessoryView();
        accessoryView.text(value);
        return accessoryView;
      } else {
        const accessoryView = this.owner.createAccessoryIconView();
        accessoryView.graphics.setState(value, View.Intrinsic);
        return accessoryView;
      }
    },
  })
  readonly accessory!: ViewFastener<ListItem, HtmlView, Graphics | string>;

  protected createAccessoryIconView(): HtmlIconView {
    return HtmlIconView.create();
  }

  protected createAccessoryView(): HtmlView {
    const accessoryView = HtmlView.span.create();
    accessoryView.display.setState("block", View.Intrinsic);
    accessoryView.fontFamily.setState("system-ui, 'Open Sans', sans-serif", View.Intrinsic);
    accessoryView.fontSize.setState(17, View.Intrinsic);
    accessoryView.whiteSpace.setState("nowrap", View.Intrinsic);
    accessoryView.textOverflow.setState("ellipsis", View.Intrinsic);
    accessoryView.overflowX.setState("hidden", View.Intrinsic);
    accessoryView.overflowY.setState("hidden", View.Intrinsic);
    return accessoryView;
  }

  protected initAccessoryView(accessoryView: HtmlView): void {
    accessoryView.flexShrink.setState(0, View.Intrinsic);
    accessoryView.width.setState(this.collapsedWidth.getStateOr(ListItem.DefaultCollapsedWidth), View.Intrinsic);
    if (accessoryView instanceof HtmlIconView) {
      accessoryView.iconWidth.setState(24, View.Intrinsic);
      accessoryView.iconHeight.setState(24, View.Intrinsic);
      accessoryView.iconColor.setState(this.getLookOr(Look.mutedColor, null));
    } else if (accessoryView.color.takesPrecedence(View.Intrinsic)) {
      const itemColor = this.getLookOr(this.highlighted.state ? Look.color : Look.mutedColor, null);
      accessoryView.color.setState(itemColor, View.Intrinsic);
    }
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    const itemColor = theme.getOr(this.highlighted.state ? Look.color : Look.mutedColor, mood, null);

    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      let backgroundColor = theme.getOr(Look.backgroundColor, mood, null);
      if (backgroundColor !== null && !this.highlighted.state && !this.gesture.isHovering()) {
        backgroundColor = backgroundColor.alpha(0);
      }
      this.backgroundColor.setState(backgroundColor, timing, View.Intrinsic);
    }

    const iconView = this.icon.view;
    if (iconView instanceof HtmlIconView) {
      iconView.iconColor.setState(itemColor, timing, 1);
    }

    const labelView = this.label.view;
    if (labelView !== null) {
      labelView.color.setState(itemColor, timing, View.Intrinsic);
    }

    const accessoryView = this.accessory.view;
    if (accessoryView instanceof HtmlIconView) {
      accessoryView.iconColor.setState(itemColor, timing, View.Intrinsic);
    } else if (accessoryView !== null) {
      accessoryView.color.setState(itemColor, timing, View.Intrinsic);
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.on("click", this.onClick);
  }

  protected override onUnmount(): void {
    this.off("click", this.onClick);
    super.onUnmount();
  }

  protected override onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    this.lineHeight.setState(this.height.state, View.Intrinsic);
    const drawerStretch = this.drawerStretch.value;
    if (drawerStretch !== void 0) {
      const labelView = this.label.view;
      if (labelView !== null) {
        labelView.display.setState(drawerStretch === 0 ? "none" : "block", View.Intrinsic);
        labelView.opacity.setState(drawerStretch, View.Intrinsic);
      }
      const accessoryView = this.accessory.view;
      if (accessoryView !== null) {
        accessoryView.display.setState(drawerStretch === 0 ? "none" : "block", View.Intrinsic);
        accessoryView.opacity.setState(drawerStretch, View.Intrinsic);
      }
    }
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    const edgeInsets = this.edgeInsets.state;
    if (edgeInsets !== null) {
      let collapsedWidth: Length | number | null = this.collapsedWidth.state;
      collapsedWidth = collapsedWidth !== null ? collapsedWidth.pxValue() : ListItem.DefaultCollapsedWidth;
      let height: Height | number | null = this.height.state;
      height = height instanceof Length ? height.pxValue() : this.clientBounds.height;

      const iconPadding = Math.max(0, (collapsedWidth - height) / 2);
      this.paddingLeft.setState(Math.max(0, edgeInsets.insetLeft - iconPadding), View.Intrinsic);
      const iconView = this.icon.view;
      if (iconView !== null) {
        iconView.width.setState(collapsedWidth, View.Intrinsic);
        iconView.height.setState(this.height.state, View.Intrinsic);
      }
      const labelView = this.label.view;
      const accessoryView = this.accessory.view;
      if (accessoryView !== null) {
        accessoryView.paddingRight.setState(edgeInsets.insetRight, View.Intrinsic);
        if (labelView !== null) {
          labelView.paddingRight.setState(null, View.Intrinsic);
        }
      } else if (labelView !== null) {
        labelView.paddingRight.setState(edgeInsets.insetRight, View.Intrinsic);
      }
    }
  }

  highlight(timing?: AnyTiming | boolean): this {
    if (!this.highlighted.state) {
      this.highlighted.setState(true);
      this.modifyMood(Feel.default, [[Feel.selected, 1], [Feel.hovering, void 0]]);
      if (timing === true) {
        timing = this.getLook(Look.timing);
      } else {
        timing = Timing.fromAny(timing);
      }
      if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
        this.backgroundColor.setState(this.getLookOr(Look.backgroundColor, null), View.Intrinsic);
      }
      const iconColor = this.getLookOr(Look.color, null);
      const iconView = this.icon.view;
      if (iconView instanceof HtmlIconView) {
        iconView.iconColor.setState(iconColor, timing);
      }
      const labelView = this.label.view;
      if (labelView !== null && labelView.color.takesPrecedence(View.Intrinsic)) {
        labelView.color.setState(iconColor, timing, View.Intrinsic);
      }
      const accessoryView = this.accessory.view;
      if (accessoryView instanceof HtmlIconView) {
        accessoryView.iconColor.setState(iconColor, timing);
      } else if (accessoryView !== null && accessoryView.color.takesPrecedence(View.Intrinsic)) {
        accessoryView.color.setState(iconColor, timing, View.Intrinsic);
      }
    }
    return this;
  }

  unhighlight(timing?: AnyTiming | boolean): this {
    if (this.highlighted.state) {
      this.highlighted.setState(false);
      this.modifyMood(Feel.default, [[Feel.selected, void 0]]);
      if (timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
        let backgroundColor = this.getLookOr(Look.backgroundColor, null);
        if (backgroundColor !== null && !this.gesture.isHovering()) {
          backgroundColor = backgroundColor.alpha(0);
        }
        this.backgroundColor.setState(backgroundColor, timing, View.Intrinsic);
      }
      const iconColor = this.getLookOr(Look.mutedColor, null);
      const iconView = this.icon.view;
      if (iconView instanceof HtmlIconView) {
        iconView.iconColor.setState(iconColor, timing, 1);
      }
      const labelView = this.label.view;
      if (labelView !== null && labelView.color.takesPrecedence(View.Intrinsic)) {
        labelView.color.setState(iconColor, timing, View.Intrinsic);
      }
      const accessoryView = this.accessory.view;
      if (accessoryView instanceof HtmlIconView) {
        accessoryView.iconColor.setState(iconColor, timing);
      } else if (accessoryView !== null && accessoryView.color.takesPrecedence(View.Intrinsic)) {
        accessoryView.color.setState(iconColor, timing, View.Intrinsic);
      }
    }
    return this;
  }

  protected override glow(input: PositionGestureInput): void {
    if (!this.highlighted.state) {
      super.glow(input);
    }
  }

  get hovers(): boolean {
    return true;
  }

  setHovers(hovers: boolean): void {
    if (this.hovers !== hovers) {
      Object.defineProperty(this, "hovers", {
        value: hovers,
        configurable: true,
        enumerable: true,
      });
    }
  }

  didStartHovering(): void {
    if (!this.highlighted.state && this.hovers) {
      this.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
        const timing = this.gesture.isPressing() ? this.getLook(Look.timing) : false;
        this.backgroundColor.setState(this.getLookOr(Look.backgroundColor, null), timing, View.Intrinsic);
      }
    }
  }

  didStopHovering(): void {
    this.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      let backgroundColor = this.getLookOr(Look.backgroundColor, null);
      if (backgroundColor !== null && !this.highlighted.state) {
        backgroundColor = backgroundColor.alpha(0);
      }
      const timing = this.getLook(Look.timing);
      this.backgroundColor.setState(backgroundColor, timing, View.Intrinsic);
    }
  }

  protected onClick(event: MouseEvent): void {
    event.stopPropagation();

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.listItemDidPress !== void 0) {
        viewObserver.listItemDidPress(this);
      }
    }

    const parentView = this.parentView;
    if (parentView instanceof ListView) {
      parentView.onPressItem(this);
    }
  }

  /** @hidden */
  static DefaultCollapsedWidth: number = 60;
}
