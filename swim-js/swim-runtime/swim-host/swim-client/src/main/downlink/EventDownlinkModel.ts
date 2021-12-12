// Copyright 2015-2021 Swim.inc
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
import type {Uri} from "@swim/uri";
import type {DownlinkContext} from "./DownlinkContext";
import {DownlinkModel} from "./DownlinkModel";
import type {DownlinkType} from "./Downlink";
import type {EventDownlink} from "./EventDownlink";

/** @internal */
export class EventDownlinkModel extends DownlinkModel {
  constructor(context: DownlinkContext, hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio?: number, rate?: number, body?: Value) {
    super(context, hostUri, nodeUri, laneUri, prio, rate, body);
  }

  override views!: ReadonlyArray<EventDownlink>;

  override get type(): DownlinkType {
    return "event";
  }
}
