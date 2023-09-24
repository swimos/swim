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
import type {TimingLike} from "@swim/util";
import type {Timing} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {EventHandler} from "@swim/component";
import {Presence} from "@swim/style";
import {PresenceAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import {View} from "@swim/view";
import type {Overflow} from "@swim/dom";
import type {PointerEvents} from "@swim/dom";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";

/** @public */
export interface SheetViewObserver<V extends SheetView = SheetView> extends HtmlViewObserver<V> {
  viewDidSetFullBleed?(fullBleed: boolean, view: V): void;

  viewWillPresent?(view: V): void;

  viewDidPresent?(view: V): void;

  viewWillDismiss?(view: V): void;

  viewDidDismiss?(view: V): void;
}

/** @public */
export class SheetView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initSheet();
  }

  protected initSheet(): void {
    this.setIntrinsic<SheetView>({
      classList: ["sheet"],
      style: {
        position: "relative",
        boxSizing: "border-box",
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehaviorY: "contain",
        overflowScrolling: "touch",
        backgroundColor: Look.backgroundColor,
      },
    });
  }

  declare readonly observerType?: Class<SheetViewObserver>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(fullBleed: boolean): void {
      this.owner.callObservers("viewDidSetFullBleed", fullBleed, this.owner);
    },
  })
  readonly fullBleed!: Property<this, boolean>;

  @Property({valueType: Number, value: 1})
  readonly sheetAlign!: Property<this, number>;

  @PresenceAnimator({
    value: Presence.presented(),
    updateFlags: View.NeedsLayout,
    init(): void {
      this.pointerEvents = void 0;
      this.overflowX = void 0;
      this.overflowY = void 0;
    },
    get transition(): Timing | boolean | null {
      return this.owner.getLookOr(Look.timing, Mood.navigating, null);
    },
    willPresent(): void {
      this.owner.callObservers("viewWillPresent", this.owner);
    },
    didPresent(): void {
      this.owner.style.pointerEvents.setState(void 0, Affinity.Transient);
      this.owner.callObservers("viewDidPresent", this.owner);
    },
    willDismiss(): void {
      this.owner.callObservers("viewWillDismiss", this.owner);
      this.pointerEvents = this.owner.style.pointerEvents.state;
      this.overflowX = this.owner.style.overflowX.state;
      this.overflowY = this.owner.style.overflowY.state;
      this.owner.style.pointerEvents.setState("none", Affinity.Transient);
      this.owner.style.overflowX.setIntrinsic("hidden");
      this.owner.style.overflowY.setIntrinsic("hidden");
    },
    didDismiss(): void {
      this.owner.style.pointerEvents.setState(this.pointerEvents, Affinity.Transient);
      this.owner.style.overflowX.setIntrinsic(this.overflowX);
      this.owner.style.overflowY.setIntrinsic(this.overflowY);
      this.pointerEvents = void 0;
      this.overflowX = void 0;
      this.overflowY = void 0;
      this.owner.callObservers("viewDidDismiss", this.owner);
    },
  })
  readonly presence!: PresenceAnimator<SheetView, Presence> & {
    /** @internal */
    pointerEvents: PointerEvents | undefined,
    /** @internal */
    overflowX: Overflow | undefined,
    /** @internal */
    overflowY: Overflow | undefined,
  };

  present(timing?: TimingLike | boolean | null): void {
    this.presence.present(timing);
  }

  dismiss(timing?: TimingLike | boolean | null): void {
    this.presence.dismiss(timing);
  }

  /** @internal */
  layoutSheet(): void {
    const sheetWidth = this.style.width.pxState();
    const sheetAlign = this.sheetAlign.value;
    const phase = this.presence.value.phase;
    this.style.left.setIntrinsic(sheetWidth * sheetAlign * (1 - phase));
  }

  @EventHandler({
    eventType: "scroll",
    bindsOwner: true,
    handle(event: Event): void {
      this.owner.requireUpdate(View.NeedsScroll);
    },
  })
  readonly scroll!: EventHandler<this>;
}
