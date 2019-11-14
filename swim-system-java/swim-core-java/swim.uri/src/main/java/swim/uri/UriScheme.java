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

import swim.codec.Debug;
import swim.codec.Display;
import swim.codec.Output;
import swim.util.HashGenCacheMap;
import swim.util.Murmur3;

public class UriScheme extends UriPart implements Comparable<UriScheme>, Debug, Display {
  protected final String name;

  protected UriScheme(String name) {
    this.name = name;
  }

  public final boolean isDefined() {
    return this.name.length() > 0;
  }

  public final String name() {
    return this.name;
  }

  @Override
  public final int compareTo(UriScheme that) {
    return this.name.compareTo(that.name);
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriScheme) {
      return this.name.equals(((UriScheme) other).name);
    }
    return false;
  }

  @Override
  public final int hashCode() {
    return Murmur3.seed(this.name);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UriScheme").write('.');
    if (isDefined()) {
      output = output.write("parse").write('(').write('"').display(this).write('"').write(')');
    } else {
      output = output.write("undefined").write('(').write(')');
    }
  }

  @Override
  public void display(Output<?> output) {
    Uri.writeScheme(this.name, output);
  }

  @Override
  public final String toString() {
    return this.name;
  }

  private static UriScheme undefined;

  private static ThreadLocal<HashGenCacheMap<String, UriScheme>> cache = new ThreadLocal<>();

  public static UriScheme undefined() {
    if (undefined == null) {
      undefined = new UriScheme("");
    }
    return undefined;
  }

  public static UriScheme from(String name) {
    if (name == null) {
      throw new NullPointerException();
    }
    final HashGenCacheMap<String, UriScheme> cache = cache();
    final UriScheme scheme = cache.get(name);
    if (scheme != null) {
      return scheme;
    } else {
      return cache.put(name, new UriScheme(name));
    }
  }

  public static UriScheme parse(String string) {
    return Uri.standardParser().parseSchemeString(string);
  }

  static HashGenCacheMap<String, UriScheme> cache() {
    HashGenCacheMap<String, UriScheme> cache = UriScheme.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.scheme.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 4;
      }
      cache = new HashGenCacheMap<String, UriScheme>(cacheSize);
      UriScheme.cache.set(cache);
    }
    return cache;
  }
}
