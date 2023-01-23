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
import type {MapDownlink} from "./MapDownlink";

/** @public */
export interface MapDownlinkObserver<K = unknown, V = unknown, D extends MapDownlink<any, K, V, any, any> = MapDownlink<unknown, K, V, any, any>> extends WarpDownlinkObserver<D> {
  willUpdate?(key: K, newValue: V, downlink: D): V | void;

  didUpdate?(key: K, newValue: V, oldValue: V, downlink: D): void;

  willRemove?(key: K, downlink: D): void;

  didRemove?(key: K, oldValue: V, downlink: D): void;

  willDrop?(lower: number, downlink: D): void;

  didDrop?(lower: number, downlink: D): void;

  willTake?(upper: number, downlink: D): void;

  didTake?(upper: number, downlink: D): void;

  willClear?(downlink: D): void;

  didClear?(downlink: D): void;
}
