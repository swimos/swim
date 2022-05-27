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
import {
  FastenerFlags,
  FastenerOwner,
  FastenerDescriptor,
  FastenerClass,
  Fastener,
} from "@swim/component";

/** @public */
export type FileRelationValue<F extends FileRelation<any, any>> =
  F extends FileRelation<any, infer T> ? T : never;

/** @public */
export interface FileRelationDescriptor<T = unknown> extends FastenerDescriptor {
  extends?: Proto<FileRelation<any, any>> | string | boolean | null;
  baseDir?: string;
  resolves?: boolean;
}

/** @public */
export type FileRelationTemplate<F extends FileRelation<any, any>> =
  ThisType<F> &
  FileRelationDescriptor<FileRelationValue<F>> &
  Partial<Omit<F, keyof FileRelationDescriptor>>;

/** @public */
export interface FileRelationClass<F extends FileRelation<any, any> = FileRelation<any, any>> extends FastenerClass<F> {
  /** @override */
  specialize(template: FileRelationDescriptor<any>): FileRelationClass<F>;

  /** @override */
  refine(fastenerClass: FileRelationClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: FileRelationTemplate<F2>): FileRelationClass<F2>;
  extend<F2 extends F>(className: string, template: FileRelationTemplate<F2>): FileRelationClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: FileRelationTemplate<F2>): FileRelationClass<F2>;
  define<F2 extends F>(className: string, template: FileRelationTemplate<F2>): FileRelationClass<F2>;

  /** @override */
  <F2 extends F>(template: FileRelationTemplate<F2>): PropertyDecorator;

  /** @internal */
  readonly ResolvesFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface FileRelation<O = unknown, T = unknown> extends Fastener<O> {
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
}

/** @public */
export const FileRelation = (function (_super: typeof Fastener) {
  const FileRelation = _super.extend("FileRelation", {
    lazy: false,
    static: true,
  }) as FileRelationClass;

  Object.defineProperty(FileRelation.prototype, "fastenerType", {
    value: FileRelation,
    configurable: true,
  });

  FileRelation.prototype.initBaseDir = function (this: FileRelation): string | undefined {
    return (Object.getPrototypeOf(this) as FileRelation).baseDir;
  };

  FileRelation.prototype.getBaseDir = function (this: FileRelation): string | undefined {
    let baseDir = this.baseDir;
    if (baseDir === void 0) {
      baseDir = process.cwd();
    }
    return baseDir;
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

  FileRelation.construct = function <F extends FileRelation<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct.call(this, fastener, owner) as F;
    const flagsInit = fastener.flagsInit;
    if (flagsInit !== void 0) {
      fastener.initResolves((flagsInit & FileRelation.ResolvesFlag) !== 0);
    }
    (fastener as Mutable<typeof fastener>).baseDir = fastener.initBaseDir();
    return fastener;
  };

  FileRelation.refine = function (fastenerClass: FileRelationClass<any>): void {
    _super.refine.call(this, fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;
    let flagsInit = fastenerPrototype.flagsInit;

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "resolves")) {
      if (flagsInit === void 0) {
        flagsInit = 0;
      }
      if (fastenerPrototype.resolves) {
        flagsInit |= FileRelation.ResolvesFlag;
      } else {
        flagsInit &= ~FileRelation.ResolvesFlag;
      }
      delete (fastenerPrototype as FileRelationDescriptor).resolves;
    }

    if (flagsInit !== void 0) {
      Object.defineProperty(fastenerPrototype, "flagsInit", {
        value: flagsInit,
        configurable: true,
      });
    }
  };

  (FileRelation as Mutable<typeof FileRelation>).ResolvesFlag = 1 << (_super.FlagShift + 0);

  (FileRelation as Mutable<typeof FileRelation>).FlagShift = _super.FlagShift + 1;
  (FileRelation as Mutable<typeof FileRelation>).FlagMask = (1 << FileRelation.FlagShift) - 1;

  return FileRelation;
})(Fastener);
