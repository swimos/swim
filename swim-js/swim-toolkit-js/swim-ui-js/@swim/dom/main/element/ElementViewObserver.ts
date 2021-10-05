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

import type {ViewObserverCache} from "@swim/view";
import type {NodeViewObserver} from "../node/NodeViewObserver";
import type {ElementView} from "./ElementView";

export interface ElementViewObserver<V extends ElementView = ElementView> extends NodeViewObserver<V> {
  viewWillSetAttribute?(name: string, value: unknown, view: V): void;

  viewDidSetAttribute?(name: string, value: unknown, view: V): void;

  viewWillSetStyle?(name: string, value: unknown, priority: string | undefined, view: V): void;

  viewDidSetStyle?(name: string, value: unknown, priority: string | undefined, view: V): void;
}

/** @internal */
export interface ElementViewObserverCache<V extends ElementView> extends ViewObserverCache<V> {
  viewWillSetAttributeObservers?: ReadonlyArray<ViewWillSetAttribute<V>>;
  viewDidSetAttributeObservers?: ReadonlyArray<ViewDidSetAttribute<V>>;
  viewWillSetStyleObservers?: ReadonlyArray<ViewWillSetStyle<V>>;
  viewDidSetStyleObservers?: ReadonlyArray<ViewDidSetStyle<V>>;
}

/** @internal */
export interface ViewWillSetAttribute<V extends ElementView = ElementView> {
  viewWillSetAttribute(name: string, value: unknown, view: V): void;
}

/** @internal */
export interface ViewDidSetAttribute<V extends ElementView = ElementView> {
  viewDidSetAttribute(name: string, value: unknown, view: V): void;
}

/** @internal */
export interface ViewWillSetStyle<V extends ElementView = ElementView> {
  viewWillSetStyle(name: string, value: unknown, priority: string | undefined, view: V): void;
}

/** @internal */
export interface ViewDidSetStyle<V extends ElementView = ElementView> {
  viewDidSetStyle(name: string, value: unknown, priority: string | undefined, view: V): void;
}
