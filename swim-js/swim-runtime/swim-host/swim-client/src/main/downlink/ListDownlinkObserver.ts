// Copyright 2015-2023 Swim.inc
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

import type {WarpDownlinkObserver} from "./WarpDownlinkObserver";
import type {ListDownlink} from "./ListDownlink";

/** @public */
export interface ListDownlinkObserver<V = unknown, D extends ListDownlink<any, V, any> = ListDownlink<unknown, V>> extends WarpDownlinkObserver<D> {
  willUpdate?(index: number, newValue: V, downlink: D): V | void;

  didUpdate?(index: number, newValue: V, oldValue: V, downlink: D): void;

  willMove?(fromIndex: number, toIndex: number, value: V, downlink: D): void;

  didMove?(fromIndex: number, toIndex: number, value: V, downlink: D): void;

  willRemove?(index: number, downlink: D): void;

  didRemove?(index: number, oldValue: V, downlink: D): void;

  willDrop?(lower: number, downlink: D): void;

  didDrop?(lower: number, downlink: D): void;

  willTake?(upper: number, downlink: D): void;

  didTake?(upper: number, downlink: D): void;

  willClear?(downlink: D): void;

  didClear?(downlink: D): void;
}
