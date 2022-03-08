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

import * as Path from "path";
import * as FS from "fs";
import {Mutable, Proto, Equals} from "@swim/util";
import {FastenerOwner, FastenerFlags, FastenerInit, FastenerClass, Fastener} from "@swim/component";

/** @internal */
export type FileRelationValue<F extends FileRelation<any, any>> =
  F extends FileRelation<any, infer T> ? T : never;

/** @public */
export interface FileRelationInit<T = unknown> extends FastenerInit {
  extends?: {prototype: FileRelation<any, any>} | string | boolean | null;
  baseDir?: string;
  resolves?: boolean;

  getBaseDir?(): string | undefined;
  willSetBaseDir?(newBaseDir: string | undefined, oldBaseDir: string | undefined): void;
  didSetBaseDir?(newBaseDir: string | undefined, oldBaseDir: string | undefined): void;

  resolveFile?(baseDir: string | undefined, fileName: string | undefined): Promise<string | undefined>;
  exists?(path: string): boolean;
  readFile?(path: string): Promise<T>;
  writeFile?(path: string, value: T): Promise<void>;

  willSetValue?(path: string, newValue: T, oldValue: T): void;
  didSetValue?(path: string, newValue: T, oldValue: T): void;

  equalValues?(newValue: T, oldValue: T): boolean;
}

/** @public */
export type FileRelationDescriptor<O = unknown, T = unknown, I = {}> = ThisType<FileRelation<O, T> & I> & FileRelationInit<T> & Partial<I>;

/** @public */
export interface FileRelationClass<F extends FileRelation<any, any> = FileRelation<any, any>> extends FastenerClass<F> {  /** @internal */
  readonly ResolvesFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface FileRelationFactory<F extends FileRelation<any, any> = FileRelation<any, any>> extends FileRelationClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): FileRelationFactory<F> & I;

  define<O, T = unknown>(className: string, descriptor: FileRelationDescriptor<O, T>): FileRelationFactory<FileRelation<any, T>>;
  define<O, T = unknown, I = {}>(className: string, descriptor: {implements: unknown} & FileRelationDescriptor<O, T, I>): FileRelationFactory<FileRelation<any, T> & I>;

  <O, T = unknown>(descriptor: FileRelationDescriptor<O, T>): PropertyDecorator;
  <O, T = unknown, I = {}>(descriptor: {implements: unknown} & FileRelationDescriptor<O, T, I>): PropertyDecorator;
}

/** @public */
export interface FileRelation<O = unknown, T = unknown> extends Fastener<O> {
  /** @override */
  get fastenerType(): Proto<FileRelation<any, any>>;

  readonly baseDir: string | undefined;

  getBaseDir(): string | undefined;

  /** @internal */
  initBaseDir(baseDir: string | undefined): void;

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
  initResolves(resolves: boolean): void;

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

  /** @internal @override */
  get lazy(): boolean; // prototype property

  /** @internal @override */
  get static(): string | boolean; // prototype property
}

/** @public */
export const FileRelation = (function (_super: typeof Fastener) {
  const FileRelation: FileRelationFactory = _super.extend("FileRelation");

  Object.defineProperty(FileRelation.prototype, "fastenerType", {
    get: function (this: FileRelation): Proto<FileRelation<any, any>> {
      return FileRelation;
    },
    configurable: true,
  });

  FileRelation.prototype.getBaseDir = function (this: FileRelation): string | undefined {
    let baseDir = this.baseDir;
    if (baseDir === void 0) {
      baseDir = process.cwd();
    }
    return baseDir;
  };

  FileRelation.prototype.initBaseDir = function (this: FileRelation, baseDir: string | undefined): void {
    (this as Mutable<typeof this>).baseDir = baseDir;
  };

  FileRelation.prototype.setBaseDir = function (this: FileRelation, newBaseDir: string | undefined): void {
    const oldBaseDir = this.baseDir;
    if (newBaseDir !== oldBaseDir) {
      this.willSetBaseDir(newBaseDir, oldBaseDir);
      (this as Mutable<typeof this>).baseDir = newBaseDir;
      this.onSetBaseDir(newBaseDir, oldBaseDir);
      this.didSetBaseDir(newBaseDir, oldBaseDir);
    }
  };

  FileRelation.prototype.willSetBaseDir = function (this: FileRelation, newBaseDir: string | undefined, oldBaseDir: string | undefined): void {
    // hook
  };

  FileRelation.prototype.onSetBaseDir = function (this: FileRelation, newBaseDir: string | undefined, oldBaseDir: string | undefined): void {
    // hook
  };

  FileRelation.prototype.didSetBaseDir = function (this: FileRelation, newBaseDir: string | undefined, oldBaseDir: string | undefined): void {
    // hook
  };

  Object.defineProperty(FileRelation.prototype, "resolves", {
    get: function (this: FileRelation): boolean {
      return (this.flags & FileRelation.ResolvesFlag) !== 0;
    },
    configurable: true,
  });

  FileRelation.prototype.setResolves = function (this: FileRelation, resolves: boolean): void {
    if (resolves) {
      (this as Mutable<typeof this>).flags |= FileRelation.ResolvesFlag;
    } else {
      (this as Mutable<typeof this>).flags &= ~FileRelation.ResolvesFlag;
    }
  };

  FileRelation.prototype.initResolves = function (this: FileRelation, resolves: boolean): void {
    if (resolves) {
      (this as Mutable<typeof this>).flags |= FileRelation.ResolvesFlag;
    } else {
      (this as Mutable<typeof this>).flags &= ~FileRelation.ResolvesFlag;
    }
  };

  FileRelation.prototype.resolveFile = async function (this: FileRelation, baseDir: string | undefined, fileName: string | undefined): Promise<string | undefined> {
    if (fileName !== void 0) {
      if (baseDir === void 0) {
        baseDir = process.cwd();
      }
      const resolves = this.resolves;
      do {
        const path = Path.resolve(baseDir, fileName);
        if (this.exists(path)) {
          return path;
        }
        if (resolves === true) {
          const parentDir = Path.dirname(baseDir);
          if (baseDir !== parentDir) {
            baseDir = parentDir;
            continue;
          }
        }
        break;
      } while (true);
    }
    return void 0;
  };

  FileRelation.prototype.exists = function (this: FileRelation, path: string): boolean {
    return FS.existsSync(path);
  };

  FileRelation.prototype.readFile = async function <T>(this: FileRelation<unknown, T>, path: string): Promise<T> {
    const buffer = await FS.promises.readFile(path, "utf8");
    return JSON.parse(buffer);
  };

  FileRelation.prototype.writeFile = async function <T>(this: FileRelation<unknown, T>, path: string, value: T): Promise<void> {
    const buffer = JSON.stringify(value, void 0, 2) + "\n";
    await FS.promises.writeFile(path, buffer, "utf8");
  };

  FileRelation.prototype.willSetValue = function <T>(this: FileRelation<unknown, T>, path: string, newValue: T, oldValue: T): void {
    // hook
  };

  FileRelation.prototype.onSetValue = function <T>(this: FileRelation<unknown, T>, path: string, newValue: T, oldValue: T): void {
    // hook
  };

  FileRelation.prototype.didSetValue = function <T>(this: FileRelation<unknown, T>, path: string, newValue: T, oldValue: T): void {
    // hook
  };

  FileRelation.prototype.equalValues = function <T>(this: FileRelation<unknown, T>, newValue: T, oldValue: T): boolean {
    return Equals(newValue, oldValue);
  };

  Object.defineProperty(FileRelation.prototype, "lazy", {
    get: function (this: FileRelation): boolean {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(FileRelation.prototype, "static", {
    get: function (this: FileRelation): string | boolean {
      return true;
    },
    configurable: true,
  });

  FileRelation.construct = function <F extends FileRelation<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).baseDir = void 0;
    return fastener;
  };

  FileRelation.define = function <O, T>(className: string, descriptor: FileRelationDescriptor<O, T>): FileRelationFactory<FileRelation<any, T>> {
    let superClass = descriptor.extends as FileRelationFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const baseDir = descriptor.baseDir;
    const resolves = descriptor.resolves;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.baseDir;
    delete descriptor.resolves;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: FileRelation<any, any>}, fastener: FileRelation<O, T> | null, owner: O): FileRelation<O, T> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (baseDir !== void 0) {
        fastener.initBaseDir(baseDir);
      }
      if (resolves !== void 0) {
        fastener.initResolves(resolves);
      }
      return fastener;
    };

    return fastenerClass;
  };

  (FileRelation as Mutable<typeof FileRelation>).ResolvesFlag = 1 << (_super.FlagShift + 0);

  (FileRelation as Mutable<typeof FileRelation>).FlagShift = _super.FlagShift + 1;
  (FileRelation as Mutable<typeof FileRelation>).FlagMask = (1 << FileRelation.FlagShift) - 1;

  return FileRelation;
})(Fastener);
