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

package swim.uri;

import swim.codec.Debug;
import swim.codec.Display;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.HashGenCacheMap;
import swim.util.Murmur3;

public class UriFragment extends UriPart implements Comparable<UriFragment>, Debug, Display {

  protected final String identifier;
  String string;

  protected UriFragment(String identifier) {
    this.identifier = identifier;
  }

  public final boolean isDefined() {
    return this.identifier != null;
  }

  public String identifier() {
    return this.identifier;
  }

  @Override
  public final int compareTo(UriFragment that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriFragment) {
      final UriFragment that = (UriFragment) other;
      return this.identifier == null ? that.identifier == null : this.identifier.equals(that.identifier);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return this.identifier == null ? 0 : Murmur3.seed(this.identifier);
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("UriFragment").write('.');
    if (this.isDefined()) {
      output = output.write("parse").write('(').write('"').display(this).write('"');
    } else {
      output = output.write("undefined").write('(');
    }
    output = output.write(')');
    return output;
  }

  @Override
  public <T> Output<T> display(Output<T> output) {
    if (this.string != null) {
      output = output.write(this.string);
    } else if (this.identifier != null) {
      output = Uri.writeFragment(output, this.identifier);
    }
    return output;
  }

  @Override
  public String toString() {
    if (this.string == null) {
      this.string = Format.display(this);
    }
    return this.string;
  }

  private static UriFragment undefined;

  public static UriFragment undefined() {
    if (UriFragment.undefined == null) {
      UriFragment.undefined = new UriFragment(null);
    }
    return UriFragment.undefined;
  }

  public static UriFragment create(String identifier) {
    if (identifier != null) {
      final HashGenCacheMap<String, UriFragment> cache = UriFragment.cache();
      final UriFragment fragment = cache.get(identifier);
      if (fragment != null) {
        return fragment;
      } else {
        return cache.put(identifier, new UriFragment(identifier));
      }
    } else {
      return UriFragment.undefined();
    }
  }

  public static UriFragment parse(String string) {
    return Uri.standardParser().parseFragmentString(string);
  }

  private static ThreadLocal<HashGenCacheMap<String, UriFragment>> cache = new ThreadLocal<>();

  static HashGenCacheMap<String, UriFragment> cache() {
    HashGenCacheMap<String, UriFragment> cache = UriFragment.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.fragment.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 32;
      }
      cache = new HashGenCacheMap<String, UriFragment>(cacheSize);
      UriFragment.cache.set(cache);
    }
    return cache;
  }

}
