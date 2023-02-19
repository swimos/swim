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

package swim.uri;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.uri.pattern.TerminalUriPattern;
import swim.uri.pattern.UriSchemePattern;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public abstract class UriPattern implements ToSource, ToString {

  @Internal
  protected UriPattern() {
    // sealed
  }

  public abstract boolean isUri();

  public abstract Uri toUri();

  public Uri apply(String... args) {
    return this.apply(args, 0);
  }

  @Internal
  public Uri apply(String[] args, int index) {
    return this.apply(UriScheme.undefined(), args, index);
  }

  @Internal
  public Uri apply(UriScheme scheme, String[] args, int index) {
    return this.apply(scheme, UriAuthority.undefined(), args, index);
  }

  @Internal
  public Uri apply(UriScheme scheme, UriAuthority authority, String[] args, int index) {
    return this.apply(scheme, authority, UriPath.empty(), args, index);
  }

  @Internal
  public Uri apply(UriScheme scheme, UriAuthority authority, UriPath path, String[] args, int index) {
    return this.apply(scheme, authority, path, UriQuery.undefined(), args, index);
  }

  @Internal
  public Uri apply(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, String[] args, int index) {
    return this.apply(scheme, authority, path, query, UriFragment.undefined(), args, index);
  }

  @Internal
  public Uri apply(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment, String[] args, int index) {
    return Uri.of(scheme, authority, path, query, fragment);
  }

  public abstract Map<String, String> unapply(Uri uri, Map<String, String> defaults);

  public Map<String, String> unapply(String uri, Map<String, String> defaults) {
    return this.unapply(Uri.parse(uri), defaults);
  }

  public Map<String, String> unapply(Uri uri) {
    return this.unapply(uri, new HashMap<String, String>());
  }

  public Map<String, String> unapply(String uri) {
    return this.unapply(Uri.parse(uri), new HashMap<String, String>());
  }

  public abstract boolean matches(Uri uri);

  public boolean matches(String uri) {
    return this.matches(Uri.parse(uri));
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriPattern) {
      final UriPattern that = (UriPattern) other;
      return this.toUri().equals(that.toUri());
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(UriPattern.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.toUri().hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    final Uri uri = this.toUri();
    if (uri.isDefined()) {
      notation.beginInvoke("Uri", "parse")
              .appendArgument(uri.toString())
              .endInvoke();
    } else {
      notation.beginInvoke("Uri", "empty").endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    this.toUri().writeString(output);
  }

  @Override
  public String toString() {
    return this.toUri().toString();
  }

  private static final UriPattern EMPTY = TerminalUriPattern.compile(Uri.empty());

  public static UriPattern empty() {
    return EMPTY;
  }

  public static UriPattern from(Uri pattern) {
    return UriSchemePattern.compile(pattern, pattern.scheme(), pattern.authority(),
                                    pattern.path(), pattern.query(), pattern.fragment());
  }

  public static UriPattern parse(String pattern) {
    return UriPattern.from(Uri.parse(pattern));
  }

}
