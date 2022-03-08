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

import type {Mutable, Dictionary, MutableDictionary} from "@swim/util";
import {StorageService} from "./StorageService";
import type {Controller} from "../controller/Controller";

/** @public */
export class EphemeralStorageService<C extends Controller = Controller> extends StorageService<C> {
  constructor(storage?: Dictionary<string>) {
    super();
    if (storage === void 0) {
      storage = {};
    }
    this.storage = storage;
  }

  readonly storage: Dictionary<string>;

  override get(key: string): string | undefined {
    return this.storage[key];
  }

  override set(key: string, newValue: string | undefined): string | undefined {
    const storage = this.storage as MutableDictionary<string>;
    const oldValue = storage[key];
    if (newValue !== oldValue) {
      this.willSet(key, newValue, oldValue);
      if (newValue !== void 0) {
        storage[key] = newValue;
      } else {
        delete storage[key];
      }
      this.onSet(key, newValue, oldValue);
      this.didSet(key, newValue, oldValue);
    }
    return oldValue;
  }

  override clear(): void {
    this.willClear();
    (this as Mutable<this>).storage = {};
    this.onClear();
    this.didClear();
  }
}
