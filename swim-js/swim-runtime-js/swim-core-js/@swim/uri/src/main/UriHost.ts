// Copyright 2015-2021 Swim Inc.
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

import {HashCode, Compare, Lazy, Strings, HashGenCacheMap} from "@swim/util";
import type {Output, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";
import {UriHostName} from "./" // forward import
import {UriHostIPv4} from "./" // forward import
import {UriHostIPv6} from "./" // forward import
import {UriHostUndefined} from "./" // forward import

/** @public */
export type AnyUriHost = UriHost | string;

/** @public */
export abstract class UriHost implements HashCode, Compare, Debug, Display {
  protected constructor() {
    // stub
  }

  isDefined(): boolean {
    return true;
  }

  abstract readonly address: string;

  get name(): string | undefined {
    return void 0;
  }

  get ipv4(): string | undefined {
    return void 0;
  }

  get ipv6(): string | undefined {
    return void 0;
  }

  toAny(): string {
    return this.toString();
  }

  compareTo(that: unknown): number {
    if (that instanceof UriHost) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriHost) {
      return this.toString() === that.toString();
    }
    return false;
  }

  hashCode(): number {
    return Strings.hash(this.toString());
  }

  abstract debug<T>(output: Output<T>): Output<T>;

  abstract display<T>(output: Output<T>): Output<T>;

  abstract toString(): string;

  @Lazy
  static undefined(): UriHost {
    return new UriHostUndefined();
  }

  static hostname(name: string): UriHost {
    const cache = UriHost.cache;
    const host = cache.get(name);
    if (host instanceof UriHostName) {
      return host;
    } else {
      return cache.put(name, new UriHostName(name));
    }
  }

  static ipv4(ipv4: string): UriHost {
    const cache = UriHost.cache;
    const host = cache.get(ipv4);
    if (host instanceof UriHostIPv4) {
      return host;
    } else {
      return cache.put(ipv4, new UriHostIPv4(ipv4));
    }
  }

  static ipv6(ipv6: string): UriHost {
    const cache = UriHost.cache;
    const host = cache.get(ipv6);
    if (host instanceof UriHostIPv6) {
      return host;
    } else {
      return cache.put(ipv6, new UriHostIPv6(ipv6));
    }
  }

  static fromAny(value: AnyUriHost | null | undefined): UriHost {
    if (value === void 0 || value === null) {
      return UriHost.undefined();
    } else if (value instanceof UriHost) {
      return value;
    } else if (typeof value === "string") {
      return UriHost.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static parse(hostPart: string): UriHost {
    return Uri.standardParser.parseHostString(hostPart);
  }

  /** @internal */
  @Lazy
  static get cache(): HashGenCacheMap<string, UriHost> {
    const cacheSize = 16;
    return new HashGenCacheMap<string, UriHost>(cacheSize);
  }
}
