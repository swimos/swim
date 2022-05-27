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

import type {Observer} from "@swim/util";
import type {Value} from "@swim/structure";
import type {WarpDownlink} from "./WarpDownlink";

/** @public */
export interface WarpDownlinkObserver<D extends WarpDownlink<any> = WarpDownlink> extends Observer<D> {
  onEvent?(body: Value, downlink: D): void;

  onCommand?(body: Value, downlink: D): void;

  willLink?(downlink: D): void;

  didLink?(downlink: D): void;

  willSync?(downlink: D): void;

  didSync?(downlink: D): void;

  willUnlink?(downlink: D): void;

  didUnlink?(downlink: D): void;

  didConnect?(downlink: D): void;

  didDisconnect?(downlink: D): void;

  didClose?(downlink: D): void;

  didFail?(error: unknown, downlink: D): void;
}
