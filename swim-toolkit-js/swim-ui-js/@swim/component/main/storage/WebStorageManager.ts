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

import {Lazy} from "@swim/util";
import type {Component} from "../Component";
import {StorageManager} from "./StorageManager";

export class WebStorageManager<C extends Component = Component> extends StorageManager<C> {
  constructor(storage: Storage) {
    super();
    Object.defineProperty(this, "storage", {
      value: storage,
      enumerable: true,
    });
    this.onStorage = this.onStorage.bind(this);
  }

  readonly storage!: Storage;

  override get(key: string): string | undefined {
    const value = this.storage.getItem(key);
    return value !== null ? value : void 0;
  }

  override set(key: string, newValue: string | undefined): string | undefined {
    let oldValue: string | null | undefined = this.storage.getItem(key);
    if (oldValue === null) {
      oldValue = void 0;
    }
    if (newValue !== oldValue) {
      this.willSet(key, newValue, oldValue);
      if (newValue !== void 0) {
        this.storage.setItem(key, newValue);
      } else {
        this.storage.removeItem(key);
      }
      this.onSet(key, newValue, oldValue);
      this.didSet(key, newValue, oldValue);
    }
    return oldValue;
  }

  override clear(): void {
    this.willClear();
    this.storage.clear();
    this.onClear();
    this.didClear();
  }

  /** @hidden */
  onStorage(event: StorageEvent): void {
    if (event.storageArea === this.storage) {
      const key = event.key;
      if (key !== null) {
        let newValue: string | null | undefined = event.newValue;
        if (newValue === null) {
          newValue = void 0;
        }
        let oldValue: string | null | undefined = event.oldValue;
        if (oldValue === null) {
          oldValue = void 0;
        }
        if (newValue !== oldValue) {
          this.willSet(key, newValue, oldValue);
          this.onSet(key, newValue, oldValue);
          this.didSet(key, newValue, oldValue);
        }
      } else {
        this.willClear();
        this.onClear();
        this.didClear();
      }
    }
  }

  protected override onAttach(): void {
    super.onAttach();
    this.attachEvents();
  }

  protected override onDetach(): void {
    this.detachEvents();
    super.onDetach();
  }

  protected attachEvents(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.onStorage);
    }
  }

  protected detachEvents(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.onStorage);
    }
  }

  @Lazy
  static local<C extends Component>(): WebStorageManager<C> | null {
    try {
      return new WebStorageManager(window.localStorage);
    } catch (e) {
      return null;
    }
  }

  @Lazy
  static session<C extends Component>(): WebStorageManager<C> | null {
    try {
      return new WebStorageManager(window.sessionStorage);
    } catch (e) {
      return null;
    }
  }
}
