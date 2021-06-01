// Copyright 2015-2021 Swim inc.
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

import {WarpClient} from "./WarpClient";

export const client: WarpClient = new WarpClient();
export const isOnline: typeof client.isOnline = client.isOnline.bind(client);
export const keepOnline: typeof client.keepOnline = client.keepOnline.bind(client);
export const downlink: typeof client.downlink = client.downlink.bind(client);
export const downlinkList: typeof client.downlinkList = client.downlinkList.bind(client);
export const downlinkMap: typeof client.downlinkMap = client.downlinkMap.bind(client);
export const downlinkValue: typeof client.downlinkValue = client.downlinkValue.bind(client);
export const hostRef: typeof client.hostRef = client.hostRef.bind(client);
export const nodeRef: typeof client.nodeRef = client.nodeRef.bind(client);
export const laneRef: typeof client.laneRef = client.laneRef.bind(client);
export const authenticate: typeof client.authenticate = client.authenticate.bind(client);
export const command: typeof client.command = client.command.bind(client);
