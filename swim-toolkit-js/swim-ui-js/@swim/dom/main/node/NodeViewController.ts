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

import {ViewController} from "@swim/view";
import type {ViewNodeType, NodeView} from "./NodeView";
import type {NodeViewObserver} from "./NodeViewObserver";

export class NodeViewController<V extends NodeView = NodeView> extends ViewController<V> implements NodeViewObserver<V> {
  get node(): ViewNodeType<V> | null {
    const view = this.view;
    return view !== null ? view.node as ViewNodeType<V> : null;
  }

  appendChildNode(childNode: Node, key?: string): void {
    const view = this.view;
    if (view !== null) {
      view.appendChildNode(childNode, key);
    } else {
      throw new Error("no view");
    }
  }

  prependChildNode(childNode: Node, key?: string): void {
    const view = this.view;
    if (view !== null) {
      view.prependChildNode(childNode, key);
    } else {
      throw new Error("no view");
    }
  }

  insertChildNode(childNode: Node, targetNode: Node | null, key?: string): void {
    const view = this.view;
    if (view !== null) {
      view.insertChildNode(childNode, targetNode, key);
    } else {
      throw new Error("no view");
    }
  }

  viewWillInsertChildNode(childNode: Node, targetNode: Node | null, view: V): void {
    // hook
  }

  viewDidInsertChildNode(childNode: Node, targetNode: Node | null, view: V): void {
    // hook
  }

  removeChildNode(childNode: Node): void {
    const view = this.view;
    if (view !== null) {
      view.removeChildNode(childNode);
    } else {
      throw new Error("no view");
    }
  }

  viewWillRemoveChildNode(childNode: Node, view: V): void {
    // hook
  }

  viewDidRemoveChildNode(childNode: Node, view: V): void {
    // hook
  }
}
