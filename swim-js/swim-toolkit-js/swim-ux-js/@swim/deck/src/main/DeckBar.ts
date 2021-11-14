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

import type {Class, Timing} from "@swim/util";
import {Affinity, Property} from "@swim/fastener";
import {AnyLength, Length} from "@swim/math";
import {Look, Feel, MoodVector, ThemeMatrix, ThemeAnimator} from "@swim/theme";
import {ViewportInsets, ViewContextType, ViewFlags, View} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {AnyDeckRail, DeckRail} from "./DeckRail";
import {DeckSlot} from "./DeckSlot";
import type {DeckBarObserver} from "./DeckBarObserver";

/** @public */
export class DeckBar extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initBar();
    this.initTheme();
  }

  protected initBar(): void {
    this.addClass("deck-bar");
    this.position.setState("relative", Affinity.Intrinsic);
    this.height.setState(this.barHeight.state, Affinity.Intrinsic);
    this.userSelect.setState("none", Affinity.Intrinsic);
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: 0,
      insetBottom: 0,
      insetLeft: 0,
    }, Affinity.Intrinsic);
  }

  override readonly observerType?: Class<DeckBarObserver>;

  protected initTheme(): void {
    this.modifyTheme(Feel.default, [[Feel.translucent, 1], [Feel.primary, 1]]);
  }

  @Property({type: DeckRail, state: null})
  readonly rail!: Property<this, DeckRail | null, AnyDeckRail | null>;

  @ThemeAnimator({type: Number, inherits: true})
  readonly deckPhase!: ThemeAnimator<this, number | undefined>;

  @Property({type: Length, state: Length.px(48), updateFlags: View.NeedsLayout})
  readonly barHeight!: Property<this, Length, AnyLength>;

  @Property({type: Length, state: Length.zero(), updateFlags: View.NeedsResize})
  readonly itemSpacing!: Property<this, Length | null, AnyLength | null>;

  @Property({type: Object, inherits: true, state: null, updateFlags: View.NeedsResize})
  readonly edgeInsets!: Property<this, ViewportInsets | null>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
      this.backgroundColor.setState(theme.getOr(Look.backgroundColor, mood, null), timing, Affinity.Intrinsic);
    }
  }

  override onInsertChild(childView: View, targetView: View | null): void {
    super.onInsertChild(childView, targetView);
    if (childView instanceof DeckSlot) {
      this.onInsertSlot(childView);
    }
  }

  protected onInsertSlot(childView: DeckSlot): void {
    childView.position.setState("absolute", Affinity.Intrinsic);
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.resizeBar(viewContext);
  }

  protected resizeBar(viewContext: ViewContextType<this>): void {
    const oldRail = !this.rail.inherited ? this.rail.state : null;
    if (oldRail !== void 0 && oldRail !== null) {
      const superRail = this.rail.superState;
      let width: Length | string | number | null = null;
      if (superRail !== void 0 && superRail !== null && superRail.width !== null) {
        width = superRail.width.pxValue();
      }
      if (width === null) {
        const parent = this.parent;
        if (parent instanceof HtmlView) {
          width = parent.width.state;
          width = width instanceof Length ? width.pxValue() : parent.node.offsetWidth;
        }
      }
      if (width === null) {
        width = this.width.state;
        width = width instanceof Length ? width.pxValue() : this.node.offsetWidth;
      }
      let edgeInsets = this.edgeInsets.superState;
      if ((edgeInsets === void 0 || edgeInsets === null) && this.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
        edgeInsets = viewContext.viewport.safeArea;
      }
      const insetTop = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetTop : 0;
      const insetLeft = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetLeft : 0;
      const insetRight = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetRight : 0;
      const spacing = this.itemSpacing.getStateOr(Length.zero()).pxValue(width);
      const newRail = oldRail.resized(width, insetLeft, insetRight, spacing);
      this.rail.setState(newRail);
      this.height.setState(this.barHeight.state.plus(insetTop), Affinity.Intrinsic);
    }
  }

  override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutBar(viewContext);
  }

  protected layoutBar(viewContext: ViewContextType<this>): void {
    let edgeInsets = this.edgeInsets.superState;
    if ((edgeInsets === void 0 || edgeInsets === null) && this.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    const insetTop = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetTop : 0;
    this.height.setState(this.barHeight.state.plus(insetTop), Affinity.Intrinsic);
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, childView: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    const needsLayout = (displayFlags & View.NeedsLayout) !== 0;
    if (needsLayout) {
      this.layoutChildViews(displayFlags, viewContext, displayChild);
    } else {
      super.displayChildren(displayFlags, viewContext, displayChild);
    }
  }

  protected layoutChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChild: (this: this, childView: View, displayFlags: ViewFlags,
                                            viewContext: ViewContextType<this>) => void): void {
    const rail = this.rail.state;
    let edgeInsets = this.edgeInsets.superState;
    if ((edgeInsets === void 0 || edgeInsets === null) && this.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
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
          childView.display.setState("flex", Affinity.Intrinsic);
          childView.left.setState(post.left, Affinity.Intrinsic);
          childView.top.setState(slotTop, Affinity.Intrinsic);
          childView.width.setState(post.width, Affinity.Intrinsic);
          childView.height.setState(slotHeight, Affinity.Intrinsic);
          childView.post.setState(post, Affinity.Intrinsic);
          childView.nextPost.setState(nextPost, Affinity.Intrinsic);
          childView.prevPost.setState(prevPost, Affinity.Intrinsic);
        } else {
          childView.display.setState("none", Affinity.Intrinsic);
          childView.left.setState(null, Affinity.Intrinsic);
          childView.top.setState(null, Affinity.Intrinsic);
          childView.width.setState(null, Affinity.Intrinsic);
          childView.height.setState(null, Affinity.Intrinsic);
          childView.post.setState(null, Affinity.Intrinsic);
          childView.nextPost.setState(null, Affinity.Intrinsic);
          childView.prevPost.setState(null, Affinity.Intrinsic);
        }
      }
      displayChild.call(this, childView, displayFlags, viewContext);
    }
    super.displayChildren(displayFlags, viewContext, layoutChildView);
  }

  /** @internal */
  didPressBackButton(event: Event | null): void {
    this.forEachObserver(function (observer: DeckBarObserver): void {
      if (observer.deckBarDidPressBackButton !== void 0) {
        observer.deckBarDidPressBackButton(event, this);
      }
    });
  }

  /** @internal */
  didPressCloseButton(event: Event | null): void {
    this.forEachObserver(function (observer: DeckBarObserver): void {
      if (observer.deckBarDidPressCloseButton !== void 0) {
        observer.deckBarDidPressCloseButton(event, this);
      }
    });
  }
}
