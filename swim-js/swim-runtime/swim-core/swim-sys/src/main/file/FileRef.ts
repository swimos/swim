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

import type {Mutable, Proto} from "@swim/util";
import type {FastenerOwner, FastenerFlags, Fastener} from "@swim/component";
import {FileRelationInit, FileRelationClass, FileRelation} from "./FileRelation";

/** @internal */
export type FileRefValue<F extends FileRef<any, any>> =
  F extends FileRef<any, infer T> ? T : never;

/** @public */
export interface FileRefInit<T = unknown> extends FileRelationInit<T> {
  extends?: {prototype: FileRef<any, any>} | string | boolean | null;
  fileName?: string;
  value?: T;

  getFileName?(): string | undefined;
  willSetFileName?(newFileName: string | undefined, oldFileName: string | undefined): void;
  didSetFileName?(newFileName: string | undefined, oldFileName: string | undefined): void;
}

/** @public */
export type FileRefDescriptor<O = unknown, T = unknown, I = {}> = ThisType<FileRef<O, T> & I> & FileRefInit<T> & Partial<I>;

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
export interface FileRefFactory<F extends FileRef<any, any> = FileRef<any, any>> extends FileRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): FileRefFactory<F> & I;

  define<O, T = unknown>(className: string, descriptor: FileRefDescriptor<O, T>): FileRefFactory<FileRef<any, T>>;
  define<O, T = unknown, I = {}>(className: string, descriptor: {implements: unknown} & FileRefDescriptor<O, T, I>): FileRefFactory<FileRef<any, T> & I>;

  <O, T = unknown>(descriptor: FileRefDescriptor<O, T>): PropertyDecorator;
  <O, T = unknown, I = {}>(descriptor: {implements: unknown} & FileRefDescriptor<O, T, I>): PropertyDecorator;
}

/** @public */
export interface FileRef<O = unknown, T = unknown> extends FileRelation<O, T> {
  (): T | null;
  (fileName: string | undefined): O;

  /** @override */
  get fastenerType(): Proto<FileRef<any, any>>;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly fileName: string | undefined;

  getFileName(): string | undefined;

  /** @internal */
  initFileName(fileName: string | undefined): void;

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

  readonly value: T;

  getOrLoad(): Promise<T>;

  getOrLoadIfExists(): Promise<T | undefined>;
  getOrLoadIfExists<E>(elseValue: E): Promise<T | E>;

  /** @internal */
  initValue(value: T): void;

  setValue(path: string, value: T): T;
}

/** @public */
export const FileRef = (function (_super: typeof FileRelation) {
  const FileRef: FileRefFactory = _super.extend("FileRef");

  Object.defineProperty(FileRef.prototype, "fastenerType", {
    get: function (this: FileRef): Proto<FileRef<any, any>> {
      return FileRef;
    },
    configurable: true,
  });

  FileRef.prototype.onInherit = function (this: FileRef, superFastener: FileRef): void {
    this.setBaseDir(superFastener.baseDir);
    this.setFileName(superFastener.fileName);
  };

  FileRef.prototype.getFileName = function (this: FileRef): string | undefined {
    return this.fileName;
  };

  FileRef.prototype.initFileName = function (this: FileRef, fileName: string | undefined): void {
    (this as Mutable<typeof this>).fileName = fileName;
  };

  FileRef.prototype.setFileName = function (this: FileRef, newFileName: string | undefined): void {
    const oldFileName = this.fileName;
    if (newFileName !== oldFileName) {
      this.willSetFileName(newFileName, oldFileName);
      (this as Mutable<typeof this>).fileName = newFileName;
      this.onSetFileName(newFileName, oldFileName);
      this.didSetFileName(newFileName, oldFileName);
    }
  };

  FileRef.prototype.willSetFileName = function (this: FileRef, newFileName: string | undefined, oldFileName: string | undefined): void {
    // hook
  };

  FileRef.prototype.onSetFileName = function (this: FileRef, newFileName: string | undefined, oldFileName: string | undefined): void {
    // hook
  };

  FileRef.prototype.didSetFileName = function (this: FileRef, newFileName: string | undefined, oldFileName: string | undefined): void {
    // hook
  };

  FileRef.prototype.resolve = function (this: FileRef): Promise<string | undefined> {
    const baseDir = this.getBaseDir();
    const fileName = this.getFileName();
    return this.resolveFile(baseDir, fileName);
  };

  Object.defineProperty(FileRef.prototype, "loaded", {
    get: function (this: FileRef): boolean {
      return (this.flags & FileRef.LoadedFlag) !== 0;
    },
    configurable: true,
  });

  FileRef.prototype.load = async function <T>(this: FileRef<unknown, T>, path?: string): Promise<T> {
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
  };

  FileRef.prototype.loadIfExists = async function <T, E>(this: FileRef<unknown, T>, path?: string, elseValue?: E): Promise<T | E> {
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
  };

  Object.defineProperty(FileRef.prototype, "modified", {
    get: function (this: FileRef): boolean {
      return (this.flags & FileRef.ModifiedFlag) !== 0;
    },
    configurable: true,
  });

  FileRef.prototype.store = async function <T>(this: FileRef<unknown, T>, path?: string, value?: T): Promise<void> {
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
  };

  FileRef.prototype.getOrLoad = async function <T>(this: FileRef<unknown, T>): Promise<T> {
    if (this.loaded) {
      return this.value;
    } else {
      return this.load();
    }
  };

  FileRef.prototype.getOrLoadIfExists = async function <T, E>(this: FileRef<unknown, T>, elseValue?: E): Promise<T | E> {
    if (this.loaded) {
      return this.value;
    } else {
      return this.loadIfExists(void 0, elseValue as E);
    }
  };

  FileRef.prototype.initValue = function <T>(this: FileRef<unknown, T>, value: T): void {
    (this as Mutable<typeof this>).value = value;
  };

  FileRef.prototype.setValue = function <T>(this: FileRef<unknown, T>, path: string, newValue: T): void {
    (this as Mutable<typeof this>).path = path;
    const oldValue = this.value;
    if (!this.equalValues(newValue, oldValue)) {
      this.willSetValue(path, newValue, oldValue);
      (this as Mutable<typeof this>).value = newValue;
      this.setFlags(this.flags | FileRef.ModifiedFlag);
      this.onSetValue(path, newValue, oldValue);
      this.didSetValue(path, newValue, oldValue);
    }
  };

  FileRef.construct = function <F extends FileRef<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (fileName?: string | undefined): FileRefValue<F> | FastenerOwner<F> {
        if (arguments.length === 0) {
          return fastener!.value;
        } else {
          fastener!.setFileName(fileName);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).fileName = void 0;
    (fastener as Mutable<typeof fastener>).path = void 0;
    (fastener as Mutable<typeof fastener>).value = void 0;
    return fastener;
  };

  FileRef.define = function <O, T>(className: string, descriptor: FileRefDescriptor<O, T>): FileRefFactory<FileRef<any, T>> {
    let superClass = descriptor.extends as FileRefFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const baseDir = descriptor.baseDir;
    const fileName = descriptor.fileName;
    const resolves = descriptor.resolves;
    const value = descriptor.value;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.baseDir;
    delete descriptor.fileName;
    delete descriptor.resolves;
    delete descriptor.value;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: FileRef<any, any>}, fastener: FileRef<O, T> | null, owner: O): FileRef<O, T> {
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
      if (fileName !== void 0) {
        fastener.initFileName(fileName);
      }
      if (resolves !== void 0) {
        fastener.initResolves(resolves);
      }
      if (value !== void 0) {
        fastener.initValue(value);
      }
      return fastener;
    };

    return fastenerClass;
  };

  (FileRef as Mutable<typeof FileRef>).LoadedFlag = 1 << (_super.FlagShift + 0);
  (FileRef as Mutable<typeof FileRef>).ModifiedFlag = 1 << (_super.FlagShift + 1);

  (FileRef as Mutable<typeof FileRef>).FlagShift = _super.FlagShift + 2;
  (FileRef as Mutable<typeof FileRef>).FlagMask = (1 << FileRef.FlagShift) - 1;

  return FileRef;
})(FileRelation);
