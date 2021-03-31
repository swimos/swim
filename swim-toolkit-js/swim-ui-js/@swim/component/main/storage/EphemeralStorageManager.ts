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

import type {Component} from "../Component";
import {StorageManager} from "./StorageManager";

export class EphemeralStorageManager<C extends Component = Component> extends StorageManager<C> {
  constructor(storage?: {[key: string]: string | undefined}) {
    super();
    if (storage === void 0) {
      storage = {};
    }
    Object.defineProperty(this, "storage", {
      value: storage,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly storage: {[key: string]: string | undefined};

  get(key: string): string | undefined {
    return this.storage[key];
  }

  set(key: string, newValue: string | undefined): string | undefined {
    const oldValue = this.storage[key];
    if (newValue !== oldValue) {
      this.willSet(key, newValue, oldValue);
      if (newValue !== void 0) {
        this.storage[key] = newValue;
      } else {
        delete this.storage[key];
      }
      this.onSet(key, newValue, oldValue);
      this.didSet(key, newValue, oldValue);
    }
    return oldValue;
  }

  clear(): void {
    this.willClear();
    Object.defineProperty(this, "storage", {
      value: {},
      enumerable: true,
      configurable: true,
    });
    this.onClear();
    this.didClear();
  }
}
