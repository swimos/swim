// Copyright 2015-2020 SWIM.AI inc.
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

import {AnimatedViewObserver} from "./AnimatedViewObserver";
import {NodeView} from "./NodeView";

export interface NodeViewObserver<V extends NodeView = NodeView> extends AnimatedViewObserver<V> {
  viewWillInsertChildNode?(childNode: Node, targetNode: Node | null, view: V): void;

  viewDidInsertChildNode?(childNode: Node, targetNode: Node | null, view: V): void;

  viewWillRemoveChildNode?(childNode: Node, view: V): void;

  viewDidRemoveChildNode?(childNode: Node, view: V): void;
}
