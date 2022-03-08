// Copyright 2015-2021 Swim.inc
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

import type {Mutable, Class, Initable, AnyTiming, Timing} from "@swim/util";
import {Affinity, MemberFastenerClass, Property} from "@swim/component";
import {Length} from "@swim/math";
import {AnyPresence, Presence, PresenceAnimator} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {ViewportInsets, ViewContextType, AnyView, View, ViewRef} from "@swim/view";
import {HtmlViewInit, HtmlView} from "@swim/dom";
import {ToolView, TitleToolView} from "@swim/toolbar";
import type {CardViewObserver} from "./CardViewObserver";

/** @public */
export class CardView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.backCardView = null;
    this.frontCardView = null;
    this.initCard();
  }

  protected initCard(): void {
    this.addClass("card");
    this.position.setState("relative", Affinity.Intrinsic);
    this.overflowX.setState("auto", Affinity.Intrinsic);
    this.overflowY.setState("auto", Affinity.Intrinsic);
    this.overflowScrolling.setState("touch", Affinity.Intrinsic);
    this.backgroundColor.setLook(Look.backgroundColor, Affinity.Intrinsic);
  }

  override readonly observerType?: Class<CardViewObserver>;

  readonly backCardView: CardView | null;

  /** @internal */
  setBackCardView(backCardView: CardView | null): void {
    (this as Mutable<this>).backCardView = backCardView;
  }

  readonly frontCardView: CardView | null;

  /** @internal */
  setFrontCardView(frontCardView: CardView | null): void {
    (this as Mutable<this>).frontCardView = frontCardView;
  }

  @ViewRef<CardView, ToolView & Initable<HtmlViewInit | string>, {create(value?: string): ToolView}>({
    implements: true,
    type: ToolView,
    willAttachView(titleView: ToolView): void {
      this.owner.callObservers("viewWillAttachTitle", titleView, this.owner);
    },
    didDetachView(titleView: ToolView): void {
      this.owner.callObservers("viewDidDetachTitle", titleView, this.owner);
    },
    create(value?: string): ToolView {
      const toolView = TitleToolView.create();
      toolView.fontSize.setState(16, Affinity.Intrinsic);
      if (value !== void 0) {
        toolView.content.setView(value);
      }
      return toolView;
    },
    fromAny(value: AnyView<ToolView> | string): ToolView {
      if (typeof value === "string") {
        return this.create(value);
      } else {
        return ToolView.fromAny(value);
      }
    },
  })
  readonly cardTitle!: ViewRef<this, ToolView & Initable<HtmlViewInit | string>> & {create(value?: string): ToolView};
  static readonly cardTitle: MemberFastenerClass<CardView, "cardTitle">;

  @Property({type: Number, value: 1})
  readonly cardAlign!: Property<this, number>;

  @Property({type: Object, inherits: true, value: null})
  readonly edgeInsets!: Property<this, ViewportInsets | null>;

  @PresenceAnimator<CardView, Presence, AnyPresence>({
    type: Presence,
    value: Presence.presented(),
    updateFlags: View.NeedsLayout,
    get transition(): Timing | null {
      return this.owner.getLookOr(Look.timing, Mood.navigating, null);
    },
    willPresent(): void {
      this.owner.callObservers("viewWillPresent", this.owner);
    },
    didPresent(): void {
      this.owner.pointerEvents.setState(void 0, Affinity.Transient);
      this.owner.callObservers("viewDidPresent", this.owner);
    },
    willDismiss(): void {
      this.owner.callObservers("viewWillDismiss", this.owner);
      this.owner.pointerEvents.setState("none", Affinity.Transient);
    },
    didDismiss(): void {
      this.owner.pointerEvents.setState(void 0, Affinity.Transient);
      this.owner.callObservers("viewDidDismiss", this.owner);
    },
  })
  readonly presence!: PresenceAnimator<this, Presence, AnyPresence>;

  present(timing?: AnyTiming | boolean): void {
    this.presence.present(timing);
  }

  dismiss(timing?: AnyTiming | boolean): void {
    this.presence.dismiss(timing);
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutCard();
  }

  protected layoutCard(): void {
    let cardWidth: Length | number | null = this.width.state;
    cardWidth = cardWidth instanceof Length ? cardWidth.pxValue() : this.node.offsetWidth;
    const phase = this.presence.value.phase;
    this.left.setState(cardWidth * this.cardAlign.value * (1 - phase), Affinity.Intrinsic);
  }
}
