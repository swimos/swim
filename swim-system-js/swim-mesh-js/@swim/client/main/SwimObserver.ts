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

import {Value} from "@swim/structure";
import {Host} from "./host/Host";
import {SwimRef} from "./SwimRef";

export type SwimDidConnect = (host: Host, swim: SwimRef) => void;
export type SwimDidAuthenticate = (body: Value, host: Host, swim: SwimRef) => void;
export type SwimDidDeauthenticate = (body: Value, host: Host, swim: SwimRef) => void;
export type SwimDidDisconnect = (host: Host, swim: SwimRef) => void;
export type SwimDidFail = (error: unknown, host: Host, swim: SwimRef) => void;

export interface SwimObserver {
  didConnect?: SwimDidConnect;
  didAuthenticate?: SwimDidAuthenticate;
  didDeauthenticate?: SwimDidDeauthenticate;
  didDisconnect?: SwimDidDisconnect;
  didFail?: SwimDidFail;
}
