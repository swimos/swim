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
import swim.codec.Format;
import swim.codec.Output;
import swim.util.HashGenCacheSet;
import swim.util.Murmur3;

public class UriPort implements Comparable<UriPort>, Debug, Display {
  protected final int number;

  protected UriPort(int number) {
    this.number = number;
  }

  public final boolean isDefined() {
    return this.number != 0;
  }

  public final int number() {
    return this.number;
  }

  @Override
  public int compareTo(UriPort that) {
    return Integer.compare(this.number, that.number);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriPort) {
      return this.number == ((UriPort) other).number;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(UriPort.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.number));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UriPort").write('.');
    if (isDefined()) {
      output = output.write("from").write('(');
      Format.displayInt(this.number, output);
      output = output.write(')');
    } else {
      output = output.write("undefined").write('(').write(')');
    }
  }

  @Override
  public void display(Output<?> output) {
    Format.displayInt(this.number, output);
  }

  @Override
  public String toString() {
    return Integer.toString(this.number);
  }

  private static int hashSeed;

  private static UriPort undefined;

  private static ThreadLocal<HashGenCacheSet<UriPort>> cache = new ThreadLocal<>();

  public static UriPort undefined() {
    if (undefined == null) {
      undefined = new UriPort(0);
    }
    return undefined;
  }

  public static UriPort from(int number) {
    if (number > 0) {
      return cache().put(new UriPort(number));
    } else if (number == 0) {
      return undefined();
    } else {
      throw new IllegalArgumentException(Integer.toString(number));
    }
  }

  public static UriPort parse(String string) {
    return Uri.standardParser().parsePortString(string);
  }

  static HashGenCacheSet<UriPort> cache() {
    HashGenCacheSet<UriPort> cache = UriPort.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.port.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 16;
      }
      cache = new HashGenCacheSet<UriPort>(cacheSize);
      UriPort.cache.set(cache);
    }
    return cache;
  }
}
