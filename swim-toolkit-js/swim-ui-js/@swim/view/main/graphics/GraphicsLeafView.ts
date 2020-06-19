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

import {BoxR2} from "@swim/math";
import {ViewFlags, View} from "../View";
import {GraphicsViewContext} from "./GraphicsViewContext";
import {GraphicsView} from "./GraphicsView";
import {GraphicsViewController} from "./GraphicsViewController";

export class GraphicsLeafView extends GraphicsView {
  get viewController(): GraphicsViewController<GraphicsLeafView> | null {
    return this._viewController;
  }

  get childViewCount(): number {
    return 0;
  }

  get childViews(): ReadonlyArray<View> {
    return [];
  }

  forEachChildView<T, S = unknown>(callback: (this: S, childView: View) => T | void,
                                   thisArg?: S): T | undefined {
    return void 0;
  }

  getChildView(key: string): View | null {
    return null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    throw new Error("unsupported");
  }

  appendChildView(childView: View, key?: string): void {
    throw new Error("unsupported");
  }

  prependChildView(childView: View, key?: string): void {
    throw new Error("unsupported");
  }

  insertChildView(childView: View, targetView: View | null, key?: string): void {
    throw new Error("unsupported");
  }

  removeChildView(key: string): View | null;
  removeChildView(childView: View): void;
  removeChildView(key: string | View): View | null | void {
    if (typeof key === "string") {
      return null;
    }
  }

  removeAll(): void {
    // nop
  }

  /** @hidden */
  doMountChildViews(): void {
    // nop
  }

  /** @hidden */
  doUnmountChildViews(): void {
    // nop
  }

  /** @hidden */
  doPowerChildViews(): void {
    // nop
  }

  /** @hidden */
  doUnpowerChildViews(): void {
    // nop
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: GraphicsViewContext): void {
    // nop
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: GraphicsViewContext): void {
    // nop
  }

  deriveViewBounds(): BoxR2 {
    return this.viewFrame;
  }

  deriveHitBounds(): BoxR2 {
    return this.viewBounds;
  }

  hitTest(x: number, y: number, viewContext: GraphicsViewContext): GraphicsView | null {
    return null;
  }
}
View.GraphicsLeaf = GraphicsLeafView;
