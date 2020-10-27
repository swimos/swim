// Copyright 2015-2020 Swim inc.
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

import {ViewNodeType, HtmlViewConstructor} from "@swim/dom";
import {PositionGestureInput} from "@swim/gesture";
import {ThemedHtmlViewInit, ThemedHtmlView} from "@swim/theme";
import {TreeCellObserver} from "./TreeCellObserver";
import {TreeCellController} from "./TreeCellController";
import {TitleTreeCell} from "./TitleTreeCell";
import {DisclosureTreeCell} from "./DisclosureTreeCell";
import {PolygonTreeCell} from "./PolygonTreeCell";

export type AnyTreeCell = TreeCell | TreeCellInit | HTMLElement;

export interface TreeCellInit extends ThemedHtmlViewInit {
  viewController?: TreeCellController;
  cellType?: TreeCellType;
}

export type TreeCellType = "title" | "disclosure" | "polygon";

export class TreeCell extends ThemedHtmlView {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("tree-cell");
    this.display.setAutoState("none");
    this.alignItems.setAutoState("center");
    this.overflowX.setAutoState("hidden");
    this.overflowY.setAutoState("hidden");
  }

  // @ts-ignore
  declare readonly viewController: TreeCellController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<TreeCellObserver>;

  initView(init: TreeCellInit): void {
    super.initView(init);
  }

  didPressHold(input: PositionGestureInput): void {
    // hook
  }

  didPress(input: PositionGestureInput, event: Event | null): void {
    if (!input.defaultPrevented) {
      this.didObserve(function (viewObserver: TreeCellObserver): void {
        if (viewObserver.cellDidPress !== void 0) {
          viewObserver.cellDidPress(input, event, this);
        }
      });
    }
  }

  static fromInit(init: TreeCellInit): TreeCell {
    let view: TreeCell;
    if (init.cellType === "title") {
      view = TreeCell.Title.create();
    } else if (init.cellType === "disclosure") {
      view = TreeCell.Disclosure.create();
    } else if (init.cellType === "polygon") {
      view = TreeCell.Polygon.create();
    } else {
      view = TreeCell.create();
    }
    view.initView(init);
    return view;
  }

  static fromAny<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | HTMLElement): InstanceType<S>;
  static fromAny(value: AnyTreeCell): TreeCell;
  static fromAny(value: AnyTreeCell): TreeCell {
    if (value instanceof this) {
      return value;
    } else if (value instanceof HTMLElement) {
      return this.fromNode(value);
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  // Forward type declarations
  /** @hidden */
  static Title: typeof TitleTreeCell; // defined by TitleTreeCell
  /** @hidden */
  static Disclosure: typeof DisclosureTreeCell; // defined by DisclosureTreeCell
  /** @hidden */
  static Polygon: typeof PolygonTreeCell; // defined by PolygonTreeCell
}
