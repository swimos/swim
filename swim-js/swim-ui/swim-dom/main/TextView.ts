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
import type {Instance} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Creatable} from "@swim/util";
import {View} from "@swim/view";
import type {NodeViewConstructor} from "./NodeView";
import type {NodeViewObserver} from "./NodeView";
import {NodeView} from "./NodeView";

/** @public */
export interface TextViewConstructor<V extends TextView = TextView> extends NodeViewConstructor<V> {
  new(node: Text): V;
}

/** @public */
export interface TextViewObserver<V extends TextView = TextView> extends NodeViewObserver<V> {
}

/** @public */
export class TextView extends NodeView {
  constructor(node: Text) {
    super(node);
  }

  override likeType?(like: {create?(): View} | Node | string): void;

  declare readonly observerType?: Class<TextViewObserver>;

  declare readonly node: Text;

  static override create<S extends new (node: Text) => Instance<S, TextView>>(this: S, text?: string): InstanceType<S>;
  static override create(text?: string): TextView;
  static override create(text?: string): TextView {
    if (text === void 0) {
      text = "";
    }
    const node = document.createTextNode(text);
    return new this(node);
  }

  static override fromLike<S extends Class<Instance<S, View>>>(this: S, value: InstanceType<S> | LikeType<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof View) {
      if (!(value instanceof this)) {
        throw new TypeError(value + " not an instance of " + this);
      }
      return value;
    } else if (value instanceof Text) {
      return (this as unknown as typeof TextView).fromNode(value) as InstanceType<S>;
    } else if (Creatable[Symbol.hasInstance](value)) {
      return (value as Creatable<InstanceType<S>>).create();
    } else if (typeof value === "string") {
      return (this as unknown as typeof TextView).create(value) as InstanceType<S>;
    }
    throw new TypeError("" + value);
  }

  static override fromNode<S extends new (node: Text) => Instance<S, TextView>>(this: S, node: Text): InstanceType<S>;
  static override fromNode(node: Text): TextView;
  static override fromNode(node: Text): TextView {
    let view = this.get(node);
    if (view === null) {
      view = new this(node);
      this.mount(view);
    }
    return view;
  }
}
