// Copyright 2015-2024 Nstream, inc.
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

import {Objects} from "@swim/util";
import type {FastenerTemplate} from "@swim/component";
import type {ValueLike} from "@swim/structure";
import type {Value} from "@swim/structure";
import type {UriLike} from "@swim/uri";
import type {WarpDownlinkContext} from "./WarpDownlinkContext";
import type {EventDownlink} from "./EventDownlink";
import type {ValueDownlink} from "./ValueDownlink";
import type {ListDownlink} from "./ListDownlink";
import type {MapDownlink} from "./MapDownlink";

/** @public */
export interface WarpRef extends WarpDownlinkContext {
  downlink(template?: FastenerTemplate<EventDownlink<WarpRef>>): EventDownlink<WarpRef>;

  downlinkValue<V = Value>(template?: FastenerTemplate<ValueDownlink<WarpRef, V>>): ValueDownlink<WarpRef, V>;

  downlinkList<V = Value>(template?: FastenerTemplate<ListDownlink<WarpRef, V>>): ListDownlink<WarpRef, V>;

  downlinkMap<K = Value, V = Value>(template?: FastenerTemplate<MapDownlink<WarpRef, K, V>>): MapDownlink<WarpRef, K, V>;

  command(hostUri: UriLike, nodeUri: UriLike, laneUri: UriLike, body: ValueLike): void;
  command(nodeUri: UriLike, laneUri: UriLike, body: ValueLike): void;
  command(laneUri: UriLike, body: ValueLike): void;
  command(body: ValueLike): void;

  authenticate(hostUri: UriLike, credentials: ValueLike): void;
  authenticate(credentials: ValueLike): void;

  hostRef(hostUri: UriLike): WarpRef;

  nodeRef(hostUri: UriLike, nodeUri: UriLike): WarpRef;
  nodeRef(nodeUri: UriLike): WarpRef;

  laneRef(hostUri: UriLike, nodeUri: UriLike, laneUri: UriLike): WarpRef;
  laneRef(nodeUri: UriLike, laneUri: UriLike): WarpRef;
  laneRef(laneUri: UriLike): WarpRef;
}

/** @public */
export const WarpRef = {
  [Symbol.hasInstance](instance: unknown): instance is WarpRef {
    return Objects.hasAllKeys<WarpRef>(instance, "downlink", "downlinkValue", "downlinkList", "downlinkMap");
  },
};
