// Copyright 2015-2021 Swim inc.
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

import type {Timing} from "@swim/mapping";
import {AnyLength, Length} from "@swim/math";
import {Look, Feel, MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewContextType, ViewFlags, View, ViewEdgeInsets, ViewProperty, ViewAnimator} from "@swim/view";
import {HtmlView, HtmlViewController} from "@swim/dom";
import {AnyDeckRail, DeckRail} from "./DeckRail";
import {DeckSlot} from "./DeckSlot";
import type {DeckBarObserver} from "./DeckBarObserver";

export class DeckBar extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initBar();
    this.initTheme();
  }

  protected initBar(): void {
    this.addClass("deck-bar");
    this.position.setState("relative", View.Intrinsic);
    this.height.setState(this.barHeight.state, View.Intrinsic);
    this.userSelect.setState("none", View.Intrinsic);
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: 0,
      insetBottom: 0,
      insetLeft: 0,
    }, View.Intrinsic);
  }

  override readonly viewController!: HtmlViewController & DeckBarObserver | null;

  override readonly viewObservers!: ReadonlyArray<DeckBarObserver>;

  protected initTheme(): void {
    this.modifyTheme(Feel.default, [[Feel.translucent, 1], [Feel.primary, 1]]);
  }

  @ViewProperty({type: DeckRail, state: null})
  readonly rail!: ViewProperty<this, DeckRail | null, AnyDeckRail | null>;

  @ViewAnimator({type: Number, inherit: true})
  readonly deckPhase!: ViewAnimator<this, number | undefined>;

  @ViewProperty({type: Length, state: Length.px(48), updateFlags: View.NeedsLayout})
  readonly barHeight!: ViewProperty<this, Length, AnyLength>;

  @ViewProperty({type: Length, state: Length.zero(), updateFlags: View.NeedsResize})
  readonly itemSpacing!: ViewProperty<this, Length | null, AnyLength | null>;

  @ViewProperty({type: Object, inherit: true, state: null, updateFlags: View.NeedsResize})
  readonly edgeInsets!: ViewProperty<this, ViewEdgeInsets | null>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      this.backgroundColor.setState(theme.getOr(Look.backgroundColor, mood, null), timing, View.Intrinsic);
    }
  }

  override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof DeckSlot) {
      this.onInsertSlot(childView);
    }
  }

  protected onInsertSlot(childView: DeckSlot): void {
    childView.position.setState("absolute", View.Intrinsic);
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.resizeBar(viewContext);
  }

  protected resizeBar(viewContext: ViewContextType<this>): void {
    const oldRail = !this.rail.isInherited() ? this.rail.ownState : null;
    if (oldRail !== void 0 && oldRail !== null) {
      const superRail = this.rail.superState;
      let width: Length | string | number | null = null;
      if (superRail !== void 0 && superRail !== null && superRail.width !== null) {
        width = superRail.width.pxValue();
      }
      if (width === null) {
        const parentView = this.parentView;
        if (parentView instanceof HtmlView) {
          width = parentView.width.state;
          width = width instanceof Length ? width.pxValue() : parentView.node.offsetWidth;
        }
      }
      if (width === null) {
        width = this.width.state;
        width = width instanceof Length ? width.pxValue() : this.node.offsetWidth;
      }
      let edgeInsets = this.edgeInsets.superState;
      if ((edgeInsets === void 0 || edgeInsets === null) && this.edgeInsets.takesPrecedence(View.Intrinsic)) {
        edgeInsets = viewContext.viewport.safeArea;
      }
      const insetTop = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetTop : 0;
      const insetLeft = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetLeft : 0;
      const insetRight = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetRight : 0;
      const spacing = this.itemSpacing.getStateOr(Length.zero()).pxValue(width);
      const newRail = oldRail.resized(width, insetLeft, insetRight, spacing);
      this.rail.setState(newRail);
      this.height.setState(this.barHeight.state.plus(insetTop), View.Intrinsic);
    }
  }

  override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutBar(viewContext);
  }

  protected layoutBar(viewContext: ViewContextType<this>): void {
    let edgeInsets = this.edgeInsets.superState;
    if ((edgeInsets === void 0 || edgeInsets === null) && this.edgeInsets.takesPrecedence(View.Intrinsic)) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    const insetTop = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetTop : 0;
    this.height.setState(this.barHeight.state.plus(insetTop), View.Intrinsic);
  }

  protected override displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    const needsLayout = (displayFlags & View.NeedsLayout) !== 0;
    if (needsLayout) {
      this.layoutChildViews(displayFlags, viewContext, displayChildView);
    } else {
      super.displayChildViews(displayFlags, viewContext, displayChildView);
    }
  }

  protected layoutChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                viewContext: ViewContextType<this>) => void): void {
    const rail = this.rail.state;
    let edgeInsets = this.edgeInsets.superState;
    if ((edgeInsets === void 0 || edgeInsets === null) && this.edgeInsets.takesPrecedence(View.Intrinsic)) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    let height: Length | number | null = this.height.state;
    height = height instanceof Length ? height.pxValue() : this.node.offsetHeight;
    const slotTop = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetTop : 0;
    const slotHeight = this.barHeight.state;
    type self = this;
    function layoutChildView(this: self, childView: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      if (childView instanceof DeckSlot) {
        const key = childView.key;
        const postIndex = rail !== null && key !== void 0 ? rail.lookupPost(key) : void 0;
        if (postIndex !== void 0) {
          const post = rail!.getPost(postIndex)!;
          const nextPost = rail!.getPost(postIndex + 1);
          const prevPost = rail!.getPost(postIndex - 1);
          childView.display.setState("flex", View.Intrinsic);
          childView.left.setState(post.left, View.Intrinsic);
          childView.top.setState(slotTop, View.Intrinsic);
          childView.width.setState(post.width, View.Intrinsic);
          childView.height.setState(slotHeight, View.Intrinsic);
          childView.post.setState(post, View.Intrinsic);
          childView.nextPost.setState(nextPost, View.Intrinsic);
          childView.prevPost.setState(prevPost, View.Intrinsic);
        } else {
          childView.display.setState("none", View.Intrinsic);
          childView.left.setState(null, View.Intrinsic);
          childView.top.setState(null, View.Intrinsic);
          childView.width.setState(null, View.Intrinsic);
          childView.height.setState(null, View.Intrinsic);
          childView.post.setState(null, View.Intrinsic);
          childView.nextPost.setState(null, View.Intrinsic);
          childView.prevPost.setState(null, View.Intrinsic);
        }
      }
      displayChildView.call(this, childView, displayFlags, viewContext);
    }
    super.displayChildViews(displayFlags, viewContext, layoutChildView);
  }

  /** @hidden */
  didPressBackButton(event: Event | null): void {
    this.didObserve(function (viewObserver: DeckBarObserver): void {
      if (viewObserver.deckBarDidPressBackButton !== void 0) {
        viewObserver.deckBarDidPressBackButton(event, this);
      }
    });
  }

  /** @hidden */
  didPressCloseButton(event: Event | null): void {
    this.didObserve(function (viewObserver: DeckBarObserver): void {
      if (viewObserver.deckBarDidPressCloseButton !== void 0) {
        viewObserver.deckBarDidPressCloseButton(event, this);
      }
    });
  }
}
