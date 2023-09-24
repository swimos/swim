// Copyright 2015-2023 Nstream, inc.
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

import * as Path from "path";
import * as FS from "fs";
import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import {Equals} from "@swim/util";
import type {FastenerFlags} from "@swim/component";
import type {FastenerDescriptor} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";

/** @public */
export interface FileRelationDescriptor<R, T> extends FastenerDescriptor<R> {
  extends?: Proto<FileRelation<any, any>> | boolean | null;
  baseDir?: string;
  resolves?: boolean;
}

/** @public */
export interface FileRelationClass<F extends FileRelation<any, any> = FileRelation<any, any>> extends FastenerClass<F> {
  /** @internal */
  readonly ResolvesFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface FileRelation<R = any, T = any> extends Fastener<R> {
  /** @override */
  get descriptorType(): Proto<FileRelationDescriptor<R, T>>;

  /** @override */
  get fastenerType(): Proto<FileRelation<any, any>>;

  initBaseDir(): string | undefined;

  readonly baseDir: string | undefined;

  getBaseDir(): string | undefined;

  setBaseDir(baseDir: string | undefined): void;

  /** @protected */
  willSetBaseDir(newBaseDir: string | undefined, oldBaseDir: string | undefined): void;

  /** @protected */
  onSetBaseDir(newBaseDir: string | undefined, oldBaseDir: string | undefined): void;

  /** @protected */
  didSetBaseDir(newBaseDir: string | undefined, oldBaseDir: string | undefined): void;

  get resolves(): boolean;

  setResolves(resolves: boolean): void;

  /** @internal */
  resolveFile(baseDir: string | undefined, fileName: string | undefined): Promise<string | undefined>;

  /** @internal */
  exists(path: string): boolean;

  /** @internal */
  readFile(path: string): Promise<T>;

  /** @internal */
  writeFile(path: string, value: T): Promise<void>;

  /** @protected */
  willSetValue(path: string, newValue: T, oldValue: T): void;

  /** @protected */
  onSetValue(path: string, newValue: T, oldValue: T): void;

  /** @protected */
  didSetValue(path: string, newValue: T, oldValue: T): void;

  /** @internal */
  equalValues(newValue: T, oldValue: T): boolean;
}

/** @public */
export const FileRelation = (<R, T, F extends FileRelation<any, any>>() => Fastener.extend<FileRelation<R, T>, FileRelationClass<F>>("FileRelation", {
  get fastenerType(): Proto<FileRelation<any, any>> {
    return FileRelation;
  },

  baseDir: void 0,

  initBaseDir(): string | undefined {
    return (Object.getPrototypeOf(this) as FileRelation<any, any>).baseDir;
  },

  getBaseDir(): string | undefined {
    let baseDir = this.baseDir;
    if (baseDir === void 0) {
      baseDir = process.cwd();
    }
    return baseDir;
  },

  setBaseDir(newBaseDir: string | undefined): void {
    const oldBaseDir = this.baseDir;
    if (newBaseDir === oldBaseDir) {
      return;
    }
    this.willSetBaseDir(newBaseDir, oldBaseDir);
    (this as Mutable<typeof this>).baseDir = newBaseDir;
    this.onSetBaseDir(newBaseDir, oldBaseDir);
    this.didSetBaseDir(newBaseDir, oldBaseDir);
  },

  willSetBaseDir(newBaseDir: string | undefined, oldBaseDir: string | undefined): void {
    // hook
  },

  onSetBaseDir(newBaseDir: string | undefined, oldBaseDir: string | undefined): void {
    // hook
  },

  didSetBaseDir(newBaseDir: string | undefined, oldBaseDir: string | undefined): void {
    // hook
  },

  get resolves(): boolean {
    return (this.flags & FileRelation.ResolvesFlag) !== 0;
  },

  setResolves(resolves: boolean): void {
    if (resolves) {
      (this as Mutable<typeof this>).flags |= FileRelation.ResolvesFlag;
    } else {
      (this as Mutable<typeof this>).flags &= ~FileRelation.ResolvesFlag;
    }
  },

  async resolveFile(baseDir: string | undefined, fileName: string | undefined): Promise<string | undefined> {
    if (fileName === void 0) {
      return;
    } else if (baseDir === void 0) {
      baseDir = process.cwd();
    }
    const resolves = this.resolves;
    do {
      const path = Path.resolve(baseDir, fileName);
      if (this.exists(path)) {
        return path;
      } else if (resolves === true) {
        const parentDir = Path.dirname(baseDir);
        if (baseDir !== parentDir) {
          baseDir = parentDir;
          continue;
        }
      }
      return void 0;
    } while (true);
  },

  exists(path: string): boolean {
    return FS.existsSync(path);
  },

  async readFile(path: string): Promise<T> {
    const buffer = await FS.promises.readFile(path, "utf8");
    return JSON.parse(buffer);
  },

  async writeFile(path: string, value: T): Promise<void> {
    const buffer = JSON.stringify(value, void 0, 2) + "\n";
    await FS.promises.writeFile(path, buffer, "utf8");
  },

  willSetValue(path: string, newValue: T, oldValue: T): void {
    // hook
  },

  onSetValue(path: string, newValue: T, oldValue: T): void {
    // hook
  },

  didSetValue(path: string, newValue: T, oldValue: T): void {
    // hook
  },

  equalValues(newValue: T, oldValue: T): boolean {
    return Equals(newValue, oldValue);
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).baseDir = fastener.initBaseDir();
    return fastener;
  },

  refine(fastenerClass: FastenerClass<FileRelation<any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    let flagsInit = fastenerPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "resolves")) {
      if (fastenerPrototype.resolves) {
        flagsInit |= FileRelation.ResolvesFlag;
      } else {
        flagsInit &= ~FileRelation.ResolvesFlag;
      }
      delete (fastenerPrototype as FileRelationDescriptor<any, any>).resolves;
    }
    Object.defineProperty(fastenerPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });
  },

  ResolvesFlag: 1 << (Fastener.FlagShift + 0),

  FlagShift: Fastener.FlagShift + 1,
  FlagMask: (1 << (Fastener.FlagShift + 1)) - 1,
}))();
