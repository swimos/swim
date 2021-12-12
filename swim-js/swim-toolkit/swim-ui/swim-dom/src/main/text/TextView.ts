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

import {Class, Creatable} from "@swim/util";
import {View} from "@swim/view";
import {AnyNodeView, NodeViewInit, NodeViewConstructor, NodeView} from "../node/NodeView";
import type {TextViewObserver} from "./TextViewObserver";

/** @public */
export interface ViewText extends Text {
  view?: TextView;
}

/** @public */
export type AnyTextView<V extends TextView = TextView> = AnyNodeView<V> | string;

/** @public */
export interface TextViewInit extends NodeViewInit {
}

/** @public */
export interface TextViewConstructor<V extends TextView = TextView, U = AnyTextView<V>> extends NodeViewConstructor<V, U> {
  new(node: Text): V;
}

/** @public */
export class TextView extends NodeView {
  constructor(node: Text) {
    super(node);
  }

  override readonly observerType?: Class<TextViewObserver>;

  override readonly node!: Text;

  override init(init: TextViewInit): void {
    super.init(init);
  }

  static override create<S extends new (node: Text) => InstanceType<S>>(this: S, text?: string): InstanceType<S>;
  static override create(text?: string): TextView;
  static override create(text?: string): TextView {
    if (text === void 0) {
      text = "";
    }
    const node = document.createTextNode(text);
    return new this(node);
  }

  static override fromNode<S extends new (node: Text) => InstanceType<S>>(this: S, node: Text): InstanceType<S>;
  static override fromNode(node: Text): TextView;
  static override fromNode(node: Text): TextView {
    let view = (node as ViewText).view;
    if (view === void 0) {
      view = new this(node);
    } else if (!(view instanceof this)) {
      throw new TypeError(view + " not an instance of " + this);
    }
    return view;
  }

  static override fromAny<S extends abstract new (...args: any) => InstanceType<S>>(this: S, value: AnyTextView<InstanceType<S>>): InstanceType<S>;
  static override fromAny(value: AnyTextView | string): TextView;
  static override fromAny(value: AnyTextView | string): TextView {
    if (value === void 0 || value === null) {
      return value;
    } else if (value instanceof View) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else if (value instanceof Node) {
      return this.fromNode(value);
    } else if (typeof value === "string") {
      return this.create(value);
    } else if (Creatable.is(value)) {
      return value.create();
    } else {
      return this.fromInit(value);
    }
  }
}
