// Copyright 2015-2022 Swim.inc
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

import type {Value} from "@swim/structure";
import type {Host} from "../host/Host";
import type {WarpRef} from "./WarpRef";

/** @public */
export type WarpDidConnect = (host: Host, warp: WarpRef) => void;
/** @public */
export type WarpDidAuthenticate = (body: Value, host: Host, warp: WarpRef) => void;
/** @public */
export type WarpDidDeauthenticate = (body: Value, host: Host, warp: WarpRef) => void;
/** @public */
export type WarpDidDisconnect = (host: Host, warp: WarpRef) => void;
/** @public */
export type WarpDidFail = (error: unknown, host: Host, warp: WarpRef) => void;

/** @public */
export interface WarpObserver {
  didConnect?: WarpDidConnect;
  didAuthenticate?: WarpDidAuthenticate;
  didDeauthenticate?: WarpDidDeauthenticate;
  didDisconnect?: WarpDidDisconnect;
  didFail?: WarpDidFail;
}
