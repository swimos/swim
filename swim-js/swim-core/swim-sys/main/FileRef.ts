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
import type {Proto} from "@swim/util";
import {Affinity} from "@swim/component";
import type {FastenerFlags} from "@swim/component";
import {Fastener} from "@swim/component";
import type {FileRelationDescriptor} from "./FileRelation";
import type {FileRelationClass} from "./FileRelation";
import {FileRelation} from "./FileRelation";

/** @public */
export interface FileRefDescriptor<R, T> extends FileRelationDescriptor<R, T> {
  extends?: Proto<FileRef<any, any>> | boolean | null;
  fileName?: string;
  value?: T;
}

/** @public */
export interface FileRefClass<F extends FileRef<any, any> = FileRef<any, any>> extends FileRelationClass<F> {
  /** @internal */
  readonly LoadedFlag: FastenerFlags;
  /** @internal */
  readonly ModifiedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface FileRef<R = any, T = any> extends FileRelation<R, T> {
  /** @override */
  get descriptorType(): Proto<FileRefDescriptor<R, T>>;

  /** @override */
  get fastenerType(): Proto<FileRef<any, any>>;

  initFileName(): string | undefined;

  readonly fileName: string | undefined;

  getFileName(): string | undefined;

  setFileName(fileName: string | undefined): void;

  /** @protected */
  willSetFileName(newFileName: string | undefined, oldFileName: string | undefined): void;

  /** @protected */
  onSetFileName(newFileName: string | undefined, oldFileName: string | undefined): void;

  /** @protected */
  didSetFileName(newFileName: string | undefined, oldFileName: string | undefined): void;

  resolve(): Promise<string | undefined>;

  get loaded(): boolean;

  load(path?: string): Promise<T>;

  loadIfExists(path?: string): Promise<T | undefined>;
  loadIfExists<E>(path: string | undefined, elseValue: E): Promise<T | E>;

  get modified(): boolean;

  store(path?: string, value?: T): Promise<void>;

  readonly path: string | undefined;

  initValue(): T;

  readonly value: T;

  setValue(path: string, value: T): T;

  getOrLoad(): Promise<T>;

  getOrLoadIfExists(): Promise<T | undefined>;
  getOrLoadIfExists<E>(elseValue: E): Promise<T | E>;

  /** @override */
  recohere(t: number): void;
}

/** @public */
export const FileRef = (<R, T, F extends FileRef<any, any>>() => FileRelation.extend<FileRef<R, T>, FileRefClass<F>>("FileRef", {
  get fastenerType(): Proto<FileRef<any, any>> {
    return FileRef;
  },

  fileName: void 0,

  initFileName(): string | undefined {
    return (Object.getPrototypeOf(this) as FileRef<any, any>).fileName;
  },

  getFileName(): string | undefined {
    return this.fileName;
  },

  setFileName(newFileName: string | undefined): void {
    const oldFileName = this.fileName;
    if (newFileName === oldFileName) {
      return;
    }
    this.willSetFileName(newFileName, oldFileName);
    (this as Mutable<typeof this>).fileName = newFileName;
    this.onSetFileName(newFileName, oldFileName);
    this.didSetFileName(newFileName, oldFileName);
  },

  willSetFileName(newFileName: string | undefined, oldFileName: string | undefined): void {
    // hook
  },

  onSetFileName(newFileName: string | undefined, oldFileName: string | undefined): void {
    // hook
  },

  didSetFileName(newFileName: string | undefined, oldFileName: string | undefined): void {
    // hook
  },

  resolve(): Promise<string | undefined> {
    const baseDir = this.getBaseDir();
    const fileName = this.getFileName();
    return this.resolveFile(baseDir, fileName);
  },

  get loaded(): boolean {
    return (this.flags & FileRef.LoadedFlag) !== 0;
  },

  async load(path?: string): Promise<T> {
    if (path === void 0) {
      const baseDir = this.getBaseDir();
      const fileName = this.getFileName();
      path = await this.resolveFile(baseDir, fileName);
      if (path === void 0) {
        let message = "unable to resolve file " + fileName;
        if (baseDir !== void 0) {
          message += " in directory " + baseDir;
        }
        throw new Error(message);
      }
    }

    const value = await this.readFile(path);
    this.setFlags(this.flags | FileRef.LoadedFlag);
    this.setValue(path, value);

    return value;
  },

  async loadIfExists<E>(path?: string, elseValue?: E): Promise<T | E> {
    if (path === void 0) {
      const baseDir = this.getBaseDir();
      const fileName = this.getFileName();
      path = await this.resolveFile(baseDir, fileName);
    }

    if (path !== void 0 && this.exists(path)) {
      const value = await this.readFile(path);
      this.setFlags(this.flags | FileRef.LoadedFlag);
      this.setValue(path, value);
      return value;
    } else {
      return elseValue as E;
    }
  },

  get modified(): boolean {
    return (this.flags & FileRef.ModifiedFlag) !== 0;
  },

  async store(path?: string, value?: T): Promise<void> {
    if (path === void 0) {
      path = this.path;
      if (path === void 0) {
        const baseDir = this.getBaseDir();
        const fileName = this.getFileName();
        path = await this.resolveFile(baseDir, fileName);
        if (path === void 0) {
          let message = "unable to resolve file " + fileName;
          if (baseDir !== void 0) {
            message += " in directory " + baseDir;
          }
          throw new Error(message);
        }
        (this as Mutable<typeof this>).path = path;
      }
    }

    if (value === void 0) {
      value = this.value;
    } else {
      this.setValue(path, value);
    }

    await this.writeFile(path, value);
    this.setFlags(this.flags & ~FileRef.ModifiedFlag);
  },

  async getOrLoad(): Promise<T> {
    if (this.loaded) {
      return this.value;
    }
    return this.load();
  },

  async getOrLoadIfExists<E>(elseValue?: E): Promise<T | E> {
    if (this.loaded) {
      return this.value;
    }
    return this.loadIfExists(void 0, elseValue as E);
  },

  value: void 0,

  initValue(): T {
    return (Object.getPrototypeOf(this) as FileRef<unknown, T>).value;
  },

  setValue(path: string, newValue: T): T {
    (this as Mutable<typeof this>).path = path;
    const oldValue = this.value;
    if (this.equalValues(newValue, oldValue)) {
      return oldValue;
    }
    this.willSetValue(path, newValue, oldValue);
    (this as Mutable<typeof this>).value = newValue;
    this.setFlags(this.flags | FileRef.ModifiedFlag);
    this.onSetValue(path, newValue, oldValue);
    this.didSetValue(path, newValue, oldValue);
    return oldValue;
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof FileRef) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setBaseDir(inlet.baseDir);
        this.setFileName(inlet.fileName);
      }
    } else {
      this.setDerived(false);
    }
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).fileName = fastener.initFileName();
    (fastener as Mutable<typeof fastener>).path = void 0;
    (fastener as Mutable<typeof fastener>).value = fastener.initValue();
    return fastener;
  },

  LoadedFlag: 1 << (FileRelation.FlagShift + 0),
  ModifiedFlag: 1 << (FileRelation.FlagShift + 1),

  FlagShift: FileRelation.FlagShift + 2,
  FlagMask: (1 << (FileRelation.FlagShift + 2)) - 1,
}))();
