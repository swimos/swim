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
import {Recon} from "@swim/recon";
import type {AnyUri, Uri} from "@swim/uri";
import {Message} from "./Message";
import {OpenSignal} from "./"; // forward import
import {OpenedSignal} from "./"; // forward import
import {CloseSignal} from "./"; // forward import
import {ClosedSignal} from "./"; // forward import
import {ConnectSignal} from "./"; // forward import
import {ConnectedSignal} from "./"; // forward import
import {DisconnectSignal} from "./"; // forward import
import {DisconnectedSignal} from "./"; // forward import
import {ErrorSignal} from "./"; // forward import

/** @public */
export abstract class Signal<S extends Signal<S> = Signal<any>> extends Message<S> {
  abstract readonly host: Uri;

  abstract withHost(host: AnyUri): S;

  static override fromValue(value: Value): Signal | null {
    switch (value.tag) {
      case "open": return OpenSignal.fromValue(value);
      case "opened": return OpenedSignal.fromValue(value);
      case "close": return CloseSignal.fromValue(value);
      case "closed": return ClosedSignal.fromValue(value);
      case "connect": return ConnectSignal.fromValue(value);
      case "connected": return ConnectedSignal.fromValue(value);
      case "disconnect": return DisconnectSignal.fromValue(value);
      case "disconnected": return DisconnectedSignal.fromValue(value);
      case "error": return ErrorSignal.fromValue(value);
      default: return null;
    }
  }

  static override parseRecon(input: string): Signal | null {
    return this.fromValue(Recon.parse(input));
  }
}
