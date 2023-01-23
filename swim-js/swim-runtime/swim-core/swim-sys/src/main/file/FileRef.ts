// Copyright 2015-2023 Swim.inc
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
import type {FastenerFlags, FastenerOwner, Fastener} from "@swim/component";
import {FileRelationDescriptor, FileRelationClass, FileRelation} from "./FileRelation";

/** @public */
export type FileRefValue<F extends FileRef<any, any>> =
  F extends {value: infer T} ? T : never;

/** @public */
export interface FileRefDescriptor<T = unknown> extends FileRelationDescriptor {
  extends?: Proto<FileRef<any, any>> | string | boolean | null;
  fileName?: string;
  value?: T;
}

/** @public */
export type FileRefTemplate<F extends FileRef<any, any>> =
  ThisType<F> &
  FileRefDescriptor<FileRefValue<F>> &
  Partial<Omit<F, keyof FileRefDescriptor>>;

/** @public */
export interface FileRefClass<F extends FileRef<any, any> = FileRef<any, any>> extends FileRelationClass<F> {
  /** @override */
  specialize(template: FileRefDescriptor<any>): FileRefClass<F>;

  /** @override */
  refine(fastenerClass: FileRefClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: FileRefTemplate<F2>): FileRefClass<F2>;
  extend<F2 extends F>(className: string, template: FileRefTemplate<F2>): FileRefClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: FileRefTemplate<F2>): FileRefClass<F2>;
  define<F2 extends F>(className: string, template: FileRefTemplate<F2>): FileRefClass<F2>;

  /** @override */
  <F2 extends F>(template: FileRefTemplate<F2>): PropertyDecorator;

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
export interface FileRef<O = unknown, T = unknown> extends FileRelation<O, T> {
  (): T | null;
  (fileName: string | undefined): O;

  /** @override */
  get fastenerType(): Proto<FileRef<any, any>>;

  /** @protected @override */
  onDerive(inlet: Fastener): void;

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
}

/** @public */
export const FileRef = (function (_super: typeof FileRelation) {
  const FileRef = _super.extend("FileRef", {}) as FileRefClass;

  Object.defineProperty(FileRef.prototype, "fastenerType", {
    value: FileRef,
    configurable: true,
  });

  FileRef.prototype.onDerive = function (this: FileRef, inlet: FileRef): void {
    this.setBaseDir(inlet.baseDir);
    this.setFileName(inlet.fileName);
  };

  FileRef.prototype.initFileName = function (this: FileRef): string | undefined {
    return (Object.getPrototypeOf(this) as FileRef).fileName;
  };

  FileRef.prototype.getFileName = function (this: FileRef): string | undefined {
    return this.fileName;
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

  FileRef.prototype.initValue = function <T>(this: FileRef<unknown, T>): T {
    return (Object.getPrototypeOf(this) as FileRef<unknown, T>).value;
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

  FileRef.construct = function <F extends FileRef<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
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
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).fileName = fastener.initFileName();
    (fastener as Mutable<typeof fastener>).path = void 0;
    (fastener as Mutable<typeof fastener>).value = fastener.initValue();
    return fastener;
  };

  (FileRef as Mutable<typeof FileRef>).LoadedFlag = 1 << (_super.FlagShift + 0);
  (FileRef as Mutable<typeof FileRef>).ModifiedFlag = 1 << (_super.FlagShift + 1);

  (FileRef as Mutable<typeof FileRef>).FlagShift = _super.FlagShift + 2;
  (FileRef as Mutable<typeof FileRef>).FlagMask = (1 << FileRef.FlagShift) - 1;

  return FileRef;
})(FileRelation);
