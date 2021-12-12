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

import {Class, Lazy} from "@swim/util";
import {Service} from "@swim/component";
import type {WarpClient} from "../client/WarpClient";
import {client} from "../client/global";
import type {WarpServiceObserver} from "./WarpServiceObserver";

/** @public */
export class WarpService<O> extends Service<O> {
  constructor(client: WarpClient) {
    super();
    this.client = client;
  }

  override readonly observerType?: Class<WarpServiceObserver<O>>;

  readonly client: WarpClient;

  @Lazy
  static global<O>(): WarpService<O> {
    return new WarpService(client);
  }
}
