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

import type {AnyUri, Uri} from "@swim/uri";
import type {AnyValue, Value} from "@swim/structure";
import type {Envelope} from "@swim/warp";
import type {HostDownlink} from "./HostDownlink";

/** @public */
export interface HostOptions {
  credentials?: Value;
  unlinkDelay?: number;
  maxReconnectTimeout?: number;
  idleTimeout?: number;
  sendBufferSize?: number;

  protocols?: string | string[];
  WebSocket?: typeof WebSocket;

  worker?: boolean;
}

/** @public */
export abstract class Host {
  abstract readonly hostUri: Uri;

  /** @internal */
  abstract readonly unlinkDelay: number;

  abstract get connected(): boolean;

  abstract get authenticated(): boolean;

  abstract readonly session: Value;

  /** @internal */
  abstract resolve(relative: AnyUri): Uri;

  /** @internal */
  abstract unresolve(absolute: AnyUri): Uri;

  abstract authenticate(credentials: AnyValue): void;

  /** @internal */
  abstract openDownlink(downlink: HostDownlink): void;

  /** @internal */
  abstract unlinkDownlink(downlink: HostDownlink): void;

  /** @internal */
  abstract closeDownlink(downlink: HostDownlink): void;

  abstract command(nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void;

  /** @internal */
  abstract open(): void;

  /** @internal */
  abstract close(): void;

  /** @internal */
  abstract closeUp(): void;

  /** @internal */
  abstract push(envelope: Envelope): void;
}
