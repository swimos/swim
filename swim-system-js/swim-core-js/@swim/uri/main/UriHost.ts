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

import {Comparable, HashCode, Murmur3, HashGenCacheMap} from "@swim/util";
import {Output, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";

export type AnyUriHost = UriHost | string;

export abstract class UriHost implements Comparable<UriHost>, HashCode, Debug, Display {
  /** @hidden */
  _hashCode?: number;

  protected constructor() {
    // stub
  }

  isDefined(): boolean {
    return true;
  }

  abstract address(): string;

  name(): string | null {
    return null;
  }

  ipv4(): string | null {
    return null;
  }

  ipv6(): string | null {
    return null;
  }

  toAny(): string {
    return this.toString();
  }

  compareTo(that: UriHost): 0 | 1 | -1 {
    const order = this.toString().localeCompare(that.toString());
    return order < 0 ? -1 : order > 0 ? 1 : 0;
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
    if (this._hashCode === void 0) {
      this._hashCode = Murmur3.hash(this.toString());
    }
    return this._hashCode;
  }

  abstract debug(output: Output): void;

  abstract display(output: Output): void;

  abstract toString(): string;

  private static _undefined?: UriHost;

  private static _cache?: HashGenCacheMap<string, UriHost>;

  static undefined(): UriHost {
    if (UriHost._undefined === void 0) {
      UriHost._undefined = new Uri.HostUndefined();
    }
    return UriHost._undefined;
  }

  static from(address: string): UriHost {
    const cache = UriHost.cache();
    const host = cache.get(address);
    if (host instanceof Uri.HostName) {
      return host;
    } else {
      return cache.put(address, new Uri.HostName(address));
    }
  }

  static ipv4(address: string): UriHost {
    const cache = UriHost.cache();
    const host = cache.get(address);
    if (host instanceof Uri.HostIPv4) {
      return host;
    } else {
      return cache.put(address, new Uri.HostIPv4(address));
    }
  }

  static ipv6(address: string): UriHost {
    const cache = UriHost.cache();
    const host = cache.get(address);
    if (host instanceof Uri.HostIPv6) {
      return host;
    } else {
      return cache.put(address, new Uri.HostIPv6(address));
    }
  }

  static fromAny(host: AnyUriHost | null | undefined): UriHost {
    if (host === null || host === void 0) {
      return UriHost.undefined();
    } else if (host instanceof UriHost) {
      return host;
    } else if (typeof host === "string") {
      return UriHost.parse(host);
    } else {
      throw new TypeError("" + host);
    }
  }

  static parse(string: string): UriHost {
    return Uri.standardParser().parseHostString(string);
  }

  /** @hidden */
  static cache(): HashGenCacheMap<string, UriHost> {
    if (UriHost._cache === void 0) {
      const cacheSize = 16;
      UriHost._cache = new HashGenCacheMap<string, UriHost>(cacheSize);
    }
    return UriHost._cache;
  }
}
Uri.Host = UriHost;
