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
import swim.codec.Output;
import swim.collections.HashTrieMap;
import swim.structure.Form;
import swim.structure.Kind;
import swim.util.Murmur3;

public abstract class UriPattern implements Debug, Display {

  UriPattern() {
    // sealed
  }

  public abstract boolean isUri();

  public abstract Uri toUri();

  public Uri apply(String... args) {
    return this.apply(args, 0);
  }

  Uri apply(String[] args, int index) {
    return this.apply(UriScheme.undefined(), args, index);
  }

  Uri apply(UriScheme scheme, String[] args, int index) {
    return this.apply(scheme, UriAuthority.undefined(), args, index);
  }

  Uri apply(UriScheme scheme, UriAuthority authority, String[] args, int index) {
    return this.apply(scheme, authority, UriPath.empty(), args, index);
  }

  Uri apply(UriScheme scheme, UriAuthority authority, UriPath path, String[] args, int index) {
    return this.apply(scheme, authority, path, UriQuery.undefined(), args, index);
  }

  Uri apply(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, String[] args, int index) {
    return this.apply(scheme, authority, path, query, UriFragment.undefined(), args, index);
  }

  Uri apply(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment, String[] args, int index) {
    return new Uri(scheme, authority, path, query, fragment);
  }

  public abstract HashTrieMap<String, String> unapply(Uri uri, HashTrieMap<String, String> defaults);

  public HashTrieMap<String, String> unapply(String uri, HashTrieMap<String, String> defaults) {
    return this.unapply(Uri.parse(uri), defaults);
  }

  public HashTrieMap<String, String> unapply(Uri uri) {
    return this.unapply(uri, HashTrieMap.<String, String>empty());
  }

  public HashTrieMap<String, String> unapply(String uri) {
    return this.unapply(Uri.parse(uri), HashTrieMap.<String, String>empty());
  }

  public abstract boolean matches(Uri uri);

  public boolean matches(String uri) {
    return this.matches(Uri.parse(uri));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriPattern) {
      final UriPattern that = (UriPattern) other;
      return this.toUri().equals(that.toUri());
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (UriPattern.hashSeed == 0) {
      UriPattern.hashSeed = Murmur3.seed(UriPattern.class);
    }
    return Murmur3.mash(Murmur3.mix(UriPattern.hashSeed, this.toUri().hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    final Uri uri = this.toUri();
    output = output.write("UriPattern").write('.');
    if (uri.isDefined()) {
      output = output.write("parse").write('(').debug(uri.toString());
    } else {
      output = output.write("empty").write('(');
    }
    output = output.write(')');
    return output;
  }

  @Override
  public <T> Output<T> display(Output<T> output) {
    return this.toUri().display(output);
  }

  @Override
  public String toString() {
    return this.toUri().toString();
  }

  private static UriPattern empty;

  public static UriPattern empty() {
    if (UriPattern.empty == null) {
      UriPattern.empty = new UriConstantPattern(Uri.empty());
    }
    return UriPattern.empty;
  }

  public static UriPattern from(Uri pattern) {
    return UriSchemePattern.compile(pattern, pattern.scheme(), pattern.authority(),
                                    pattern.path(), pattern.query(), pattern.fragment());
  }

  public static UriPattern parse(String pattern) {
    return UriPattern.from(Uri.parse(pattern));
  }

  private static Form<UriPattern> form;

  @Kind
  public static Form<UriPattern> form() {
    if (UriPattern.form == null) {
      UriPattern.form = new UriPatternForm(UriPattern.empty());
    }
    return UriPattern.form;
  }

}
