// Copyright 2015-2020 Swim inc.
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

import {WarpClient, client} from "@swim/client";
import {Model} from "../Model";
import {ModelManager} from "../manager/ModelManager";
import {WarpManagerObserver} from "./WarpManagerObserver";

export class WarpManager<M extends Model = Model> extends ModelManager<M> {
  /** @hidden */
  _client: WarpClient;

  constructor(client: WarpClient) {
    super();
    this._client = client;
  }

  get client(): WarpClient {
    return this._client;
  }

  // @ts-ignore
  declare readonly modelManagerObservers: ReadonlyArray<WarpManagerObserver>;

  private static _global?: WarpManager<any>;
  static global<M extends Model>(): WarpManager<M> {
    if (WarpManager._global === void 0) {
      WarpManager._global = new WarpManager(client);
    }
    return WarpManager._global;
  }
}
ModelManager.Warp = WarpManager;
