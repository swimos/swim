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

import type {ViewConstructor, View} from "@swim/view";
import {NodeViewInit, NodeViewConstructor, NodeView} from "../node/NodeView";
import type {TextViewObserver} from "./TextViewObserver";
import type {TextViewController} from "./TextViewController";

export interface ViewText extends Text {
  view?: TextView;
}

export interface TextViewInit extends NodeViewInit {
  viewController?: TextViewController;
}

export interface TextViewConstructor<V extends TextView = TextView> extends NodeViewConstructor<V> {
}

export class TextView extends NodeView {
  constructor(node: Text) {
    super(node);
  }

  override readonly node!: Text;

  override readonly viewController!: TextViewController | null;

  override readonly viewObservers!: ReadonlyArray<TextViewObserver>;

  override initView(init: TextViewInit): void {
    super.initView(init);
  }

  static create(value: string = ""): TextView {
    const node = document.createTextNode(value);
    return new TextView(node);
  }

  static override fromConstructor<V extends NodeView>(viewConstructor: NodeViewConstructor<V>): V;
  static override fromConstructor<V extends View>(viewConstructor: ViewConstructor<V>): V;
  static override fromConstructor(viewConstructor: NodeViewConstructor | ViewConstructor): View;
  static override fromConstructor(viewConstructor: NodeViewConstructor | ViewConstructor): View {
    if (viewConstructor.prototype instanceof TextView) {
      const node = document.createTextNode("");
      return new viewConstructor(node);
    } else {
      return super.fromConstructor(viewConstructor);
    }
  }
}
