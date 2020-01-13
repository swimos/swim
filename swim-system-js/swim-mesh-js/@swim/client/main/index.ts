// Copyright 2015-2020 SWIM.AI inc.
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

export * from "./host";

export * from "./downlink";

export * from "./ref";

export {WarpRef, SwimRef} from "./WarpRef";
export {WarpObserver, SwimObserver} from "./WarpObserver";

export {
  WarpClientOptions, SwimClientOptions,
  WarpClient, SwimClient,
} from "./WarpClient";

import {WarpClient} from "./WarpClient";
export const client = new WarpClient();
export const isOnline = client.isOnline.bind(client);
export const keepOnline = client.keepOnline.bind(client);
export const downlink = client.downlink.bind(client);
export const downlinkList = client.downlinkList.bind(client);
export const downlinkMap = client.downlinkMap.bind(client);
export const downlinkValue = client.downlinkValue.bind(client);
export const hostRef = client.hostRef.bind(client);
export const nodeRef = client.nodeRef.bind(client);
export const laneRef = client.laneRef.bind(client);
export const authenticate = client.authenticate.bind(client);
export const command = client.command.bind(client);
