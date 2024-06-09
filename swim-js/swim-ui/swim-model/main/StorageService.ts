// Copyright 2015-2024 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import type {Dictionary} from "@swim/util";
import type {MutableDictionary} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {EventHandler} from "@swim/component";
import type {ServiceObserver} from "@swim/component";
import {Service} from "@swim/component";

/** @public */
export interface StorageServiceObserver<S extends StorageService = StorageService> extends ServiceObserver<S> {
  serviceWillStore?(key: string, newValue: string | undefined, oldValue: string | undefined, service: S): void;

  serviceDidStore?(key: string, newValue: string | undefined, oldValue: string | undefined, service: S): void;

  serviceWillClear?(service: S): void;

  serviceDidClear?(service: S): void;
}

/** @public */
export abstract class StorageService extends Service {
  declare readonly observerType?: Class<StorageServiceObserver>;

  abstract get(key: string): string | undefined;

  abstract override set(key: string, newValue: string | undefined): string | undefined;
  abstract override set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this;

  protected willSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    this.callObservers("serviceWillStore", key, newValue, oldValue, this);
  }

  protected onSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    // hook
  }

  protected didSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    this.callObservers("serviceDidStore", key, newValue, oldValue, this);
  }

  abstract clear(): void;

  protected willClear(): void {
    this.callObservers("serviceWillClear", this);
  }

  protected onClear(): void {
    // hook
  }

  protected didClear(): void {
    this.callObservers("serviceDidClear", this);
  }

  static override create(): StorageService;
  static override create(): StorageService;
  static override create(): StorageService {
    let service: StorageService | null = WebStorageService.local();
    if (service === null) {
      service = new EphemeralStorageService();
    }
    return service;
  }
}

/** @public */
export class WebStorageService extends StorageService {
  constructor(storageArea: Storage) {
    super();
    this.storageArea = storageArea;
  }

  readonly storageArea: Storage;

  override get(key: string): string | undefined {
    const value = this.storageArea.getItem(key);
    return value !== null ? value : void 0;
  }

  override set(key: string, newValue: string | undefined): string | undefined;
  override set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this;
  override set(key: string | {[K in keyof WebStorageService as WebStorageService[K] extends {set(value: any): any} ? K : never]?: WebStorageService[K] extends {set(value: infer T): any} ? T : never}, newValue?: string | TimingLike | boolean | null): string | undefined | this {
    if (typeof key !== "string") {
      Service.prototype.set.call(this, key, newValue as TimingLike | boolean | null | undefined);
      return this;
    }
    let oldValue: string | null | undefined = this.storageArea.getItem(key);
    if (oldValue === null) {
      oldValue = void 0;
    }
    if (newValue === oldValue) {
      return oldValue;
    }
    this.willSet(key, newValue as string | undefined, oldValue);
    if (newValue !== void 0) {
      this.storageArea.setItem(key, newValue as string);
    } else {
      this.storageArea.removeItem(key);
    }
    this.onSet(key, newValue as string | undefined, oldValue);
    this.didSet(key, newValue as string | undefined, oldValue);
    return oldValue;
  }

  override clear(): void {
    this.willClear();
    this.storageArea.clear();
    this.onClear();
    this.didClear();
  }

  @EventHandler({
    eventType: "storage",
    target: typeof window !== "undefined" ? window : null,
    handle(event: StorageEvent): void {
      if (event.storageArea !== this.owner.storageArea) {
        return;
      }
      const key = event.key;
      if (key === null) {
        this.owner.willClear();
        this.owner.onClear();
        this.owner.didClear();
        return;
      }
      let newValue: string | null | undefined = event.newValue;
      if (newValue === null) {
        newValue = void 0;
      }
      let oldValue: string | null | undefined = event.oldValue;
      if (oldValue === null) {
        oldValue = void 0;
      }
      if (newValue !== oldValue) {
        this.owner.willSet(key, newValue, oldValue);
        this.owner.onSet(key, newValue, oldValue);
        this.owner.didSet(key, newValue, oldValue);
      }
    },
  })
  readonly storageEvent!: EventHandler<this>;

  /** @internal */
  static Local: WebStorageService | null | undefined = void 0;

  static local(): WebStorageService | null {
    if (this.Local === void 0) {
      try {
        this.Local = new WebStorageService(window.localStorage);
      } catch (e) {
        this.Local = null;
      }
    }
    return this.Local;
  }

  /** @internal */
  static Session: WebStorageService | null | undefined = void 0;

  static session(): WebStorageService | null {
    if (this.Session === void 0) {
      try {
        this.Session = new WebStorageService(window.sessionStorage);
      } catch (e) {
        this.Session = null;
      }
    }
    return this.Session;
  }
}

/** @public */
export class EphemeralStorageService extends StorageService {
  constructor(storageArea?: Dictionary<string>) {
    super();
    if (storageArea === void 0) {
      storageArea = {};
    }
    this.storageArea = storageArea;
  }

  readonly storageArea: Dictionary<string>;

  override get(key: string): string | undefined {
    return this.storageArea[key];
  }

  override set(key: string, newValue: string | undefined): string | undefined;
  override set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this;
  override set(key: string | {[K in keyof EphemeralStorageService as EphemeralStorageService[K] extends {set(value: any): any} ? K : never]?: EphemeralStorageService[K] extends {set(value: infer T): any} ? T : never}, newValue?: string | TimingLike | boolean | null): string | undefined | this {
    if (typeof key !== "string") {
      Service.prototype.set.call(this, key, newValue as TimingLike | boolean | null | undefined);
      return this;
    }
    const storageArea = this.storageArea as MutableDictionary<string>;
    const oldValue = storageArea[key];
    if (newValue === oldValue) {
      return oldValue;
    }
    this.willSet(key, newValue as string | undefined, oldValue);
    if (newValue !== void 0) {
      storageArea[key] = newValue as string;
    } else {
      delete storageArea[key];
    }
    this.onSet(key, newValue as string | undefined, oldValue);
    this.didSet(key, newValue as string | undefined, oldValue);
    return oldValue;
  }

  override clear(): void {
    this.willClear();
    (this as Mutable<this>).storageArea = {};
    this.onClear();
    this.didClear();
  }
}
