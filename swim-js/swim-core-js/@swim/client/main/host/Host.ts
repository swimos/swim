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

import {AnyUri, Uri} from "@swim/uri";
import {AnyValue, Value} from "@swim/structure";
import {Envelope} from "@swim/warp";
import {HostDownlink} from "./HostDownlink";

export interface HostOptions {
  credentials?: Value;
  maxReconnectTimeout?: number;
  idleTimeout?: number;
  sendBufferSize?: number;
}

/** @hidden */
export abstract class Host {
  abstract hostUri(): Uri;

  abstract isConnected(): boolean;

  abstract isAuthenticated(): boolean;

  abstract session(): Value;

  abstract resolve(relative: AnyUri): Uri;

  abstract unresolve(absolute: AnyUri): Uri;

  abstract authenticate(credentials: AnyValue): void;

  abstract openDownlink(downlink: HostDownlink): void;

  abstract unlinkDownlink(downlink: HostDownlink): void;

  abstract closeDownlink(downlink: HostDownlink): void;

  abstract command(nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void;

  abstract open(): void;

  abstract close(): void;

  abstract closeUp(): void;

  abstract push(envelope: Envelope): void;
}
