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

import type {Class} from "@swim/util";
import {Property} from "@swim/component";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import {Hyperlink} from "@swim/controller";

/** @public */
export interface CellViewObserver<V extends CellView = CellView> extends HtmlViewObserver<V> {
  viewDidPress?(input: PositionGestureInput, event: Event | null, view: V): void;

  viewDidLongPress?(input: PositionGestureInput, view: V): void;
}

/** @public */
export class CellView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initCell();
  }

  protected initCell(): void {
    this.setIntrinsic<CellView>({
      classList: ["cell"],
      style: {
        overflow: "hidden",
      },
    });
  }

  declare readonly observerType?: Class<CellViewObserver>;

  @Property({
    valueType: Hyperlink,
    value: null,
    didSetValue(hyperlink: Hyperlink | null): void {
      if (hyperlink !== null) {
        this.owner.setIntrinsic<CellView>({
          attributes: {
            href: hyperlink.href,
            title: hyperlink.title,
          },
          style: {
            textDecorationLine: "underline",
            cursor: "pointer",
          },
        });
      } else {
        this.owner.setIntrinsic<CellView>({
          attributes: {
            href: void 0,
            title: void 0,
          },
          style: {
            textDecorationLine: void 0,
            cursor: void 0,
          },
        });
      }
    },
  })
  get hyperlink(): Property<this, Hyperlink | null> {
    return Property.getter();
  }

  didPress(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("viewDidPress", input, event, this);
    const hyperlink = Property.tryValue(this, "hyperlink");
    if (hyperlink !== null && !input.defaultPrevented) {
      input.preventDefault();
      hyperlink.activate(event);
    }
  }

  didLongPress(input: PositionGestureInput): void {
    this.callObservers("viewDidLongPress", input, this);
  }
}
