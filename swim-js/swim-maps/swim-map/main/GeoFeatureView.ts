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
import {Property} from "@swim/component";
import type {PositionGestureInput} from "@swim/view";
import {PositionGesture} from "@swim/view";
import {Hyperlink} from "@swim/controller";
import type {GeoViewObserver} from "./GeoView";
import {GeoView} from "./GeoView";
import type {GeoRippleOptions} from "./GeoRippleView";
import {GeoRippleView} from "./GeoRippleView";

/** @public */
export interface GeoFeatureViewObserver<V extends GeoFeatureView = GeoFeatureView> extends GeoViewObserver<V> {
  viewDidEnter?(view: V): void;

  viewDidLeave?(view: V): void;

  viewDidPress?(input: PositionGestureInput, event: Event | null, view: V): void;

  viewDidLongPress?(input: PositionGestureInput, view: V): void;
}

/** @public */
export class GeoFeatureView extends GeoView {
  declare readonly observerType?: Class<GeoFeatureViewObserver>;

  @Property({valueType: Hyperlink, value: null})
  get hyperlink(): Property<this, Hyperlink | null> {
    return Property.getter();
  }

  @PositionGesture({
    bindsOwner: true,
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      const dx = input.x - input.x0;
      const dy = input.y - input.y0;
      if (dx * dx + dy * dy > 4 * 4) {
        this.cancelPress(input, event);
      }
    },
    didStartHovering(): void {
      this.owner.callObservers("viewDidEnter", this.owner);
    },
    didStopHovering(): void {
      this.owner.callObservers("viewDidLeave", this.owner);
    },
    didPress(input: PositionGestureInput, event: Event | null): void {
      if (input.defaultPrevented) {
        return;
      }
      this.owner.didPress(input, event);
    },
    didLongPress(input: PositionGestureInput): void {
      if (input.defaultPrevented) {
        return;
      }
      this.owner.didLongPress(input);
    },
  })
  readonly gesture!: PositionGesture<this, GeoFeatureView>;

  didPress(input: PositionGestureInput, event: Event | null): void {
    if (input.defaultPrevented) {
      return;
    }
    this.callObservers("viewDidPress", input, event, this);
    const hyperlink = this.hyperlink.value;
    if (hyperlink !== null && !input.defaultPrevented) {
      input.preventDefault();
      hyperlink.activate(event);
    }
  }

  didLongPress(input: PositionGestureInput): void {
    if (input.defaultPrevented) {
      return;
    }
    this.callObservers("viewDidLongPress", input, this);
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }
}
