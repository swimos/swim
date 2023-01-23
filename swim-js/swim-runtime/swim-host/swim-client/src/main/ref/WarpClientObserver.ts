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

import type {Observer} from "@swim/util";
import type {Value} from "@swim/structure";
import type {WarpHost} from "../host/WarpHost";
import type {WarpClient} from "./WarpClient";

/** @public */
export interface WarpClientObserver<C extends WarpClient = WarpClient> extends Observer {
  clientDidConnect?(host: WarpHost, client: C): void;

  clientDidAuthenticate?(body: Value, host: WarpHost, client: C): void;

  clientDidDeauthenticate?(body: Value, host: WarpHost, client: C): void;

  clientDidDisconnect?(host: WarpHost, client: C): void;

  clientDidFail?(error: unknown, host: WarpHost, client: C): void;
}
