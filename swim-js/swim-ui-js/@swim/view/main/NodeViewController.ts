// Copyright 2015-2019 SWIM.AI inc.
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

import {ViewController} from "./ViewController";
import {ViewNode, NodeView} from "./NodeView";
import {NodeViewObserver} from "./NodeViewObserver";

export class NodeViewController<V extends NodeView = NodeView> extends ViewController<V> implements NodeViewObserver<V> {
  get node(): ViewNode | null {
    const view = this._view;
    return view ? view.node : null;
  }

  appendChildNode(childNode: Node): void {
    const view = this._view;
    if (view) {
      view.appendChildNode(childNode);
    } else {
      throw new Error("no view");
    }
  }

  prependChildNode(childNode: Node): void {
    const view = this._view;
    if (view) {
      view.prependChildNode(childNode);
    } else {
      throw new Error("no view");
    }
  }

  insertChildNode(childNode: Node, targetNode: Node | null): void {
    const view = this._view;
    if (view) {
      view.insertChildNode(childNode, targetNode);
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
    const view = this._view;
    if (view) {
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

  viewWillAnimate(frame: number, view: V): void {
    // hook
  }

  viewDidAnimate(frame: number, view: V): void {
    // hook
  }
}
