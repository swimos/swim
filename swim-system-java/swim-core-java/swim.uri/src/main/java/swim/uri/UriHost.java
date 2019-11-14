// Copyright 2015-2019 SWIM.AI inc.
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

package swim.uri;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.UnknownHostException;
import swim.codec.Debug;
import swim.codec.Display;
import swim.codec.Output;
import swim.util.HashGenCacheMap;
import swim.util.Murmur3;

public abstract class UriHost implements Comparable<UriHost>, Debug, Display {
  protected UriHost() {
    // stub
  }

  public boolean isDefined() {
    return true;
  }

  public abstract String address();

  public String name() {
    return null;
  }

  public String ipv4() {
    return null;
  }

  public String ipv6() {
    return null;
  }

  public InetAddress inetAddress() throws UnknownHostException {
    return InetAddress.getByName(address());
  }

  @Override
  public final int compareTo(UriHost that) {
    return toString().compareTo(that.toString());
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriHost) {
      return toString().equals(((UriHost) other).toString());
    }
    return false;
  }

  @Override
  public final int hashCode() {
    return Murmur3.seed(toString());
  }

  @Override
  public abstract void debug(Output<?> output);

  @Override
  public abstract void display(Output<?> output);

  @Override
  public abstract String toString();

  private static UriHost undefined;

  private static ThreadLocal<HashGenCacheMap<String, UriHost>> cache = new ThreadLocal<>();

  public static UriHost undefined() {
    if (undefined == null) {
      undefined = new UriHostUndefined();
    }
    return undefined;
  }

  public static UriHost name(String address) {
    if (address == null) {
      throw new NullPointerException();
    }
    final HashGenCacheMap<String, UriHost> cache = cache();
    final UriHost host = cache.get(address);
    if (host instanceof UriHostName) {
      return host;
    } else {
      return cache.put(address, new UriHostName(address));
    }
  }

  public static UriHost ipv4(String address) {
    if (address == null) {
      throw new NullPointerException();
    }
    final HashGenCacheMap<String, UriHost> cache = cache();
    final UriHost host = cache.get(address);
    if (host instanceof UriHostIPv4) {
      return host;
    } else {
      return cache.put(address, new UriHostIPv4(address));
    }
  }

  public static UriHost ipv6(String address) {
    if (address == null) {
      throw new NullPointerException();
    }
    final HashGenCacheMap<String, UriHost> cache = cache();
    final UriHost host = cache.get(address);
    if (host instanceof UriHostIPv6) {
      return host;
    } else {
      return cache.put(address, new UriHostIPv6(address));
    }
  }

  public static UriHost inetAddress(InetAddress address) {
    if (address == null) {
      throw new NullPointerException();
    }
    if (address instanceof Inet4Address) {
      return ipv4(address.getHostAddress());
    } else if (address instanceof Inet6Address) {
      return ipv6(address.getHostAddress());
    } else {
      return name(address.getHostName());
    }
  }

  public static UriHost parse(String string) {
    return Uri.standardParser().parseHostString(string);
  }

  static HashGenCacheMap<String, UriHost> cache() {
    HashGenCacheMap<String, UriHost> cache = UriHost.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.host.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 16;
      }
      cache = new HashGenCacheMap<String, UriHost>(cacheSize);
      UriHost.cache.set(cache);
    }
    return cache;
  }
}
