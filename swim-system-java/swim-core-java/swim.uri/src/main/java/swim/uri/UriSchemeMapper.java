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

import swim.collections.HashTrieMap;

abstract class UriSchemeMapper<T> extends UriMapper<T> {
  abstract UriMapper<T> getSuffix(UriScheme scheme, UriAuthority authority, UriPath path,
                                  UriQuery query, UriFragment fragment);

  @Override
  public UriMapper<T> getSuffix(Uri uri) {
    return getSuffix(uri.scheme(), uri.authority(), uri.path(), uri.query(), uri.fragment());
  }

  abstract T get(UriScheme scheme, UriAuthority authority, UriPath path,
                 UriQuery query, UriFragment fragment);

  @Override
  public T get(Uri uri) {
    return get(uri.scheme(), uri.authority(), uri.path(), uri.query(), uri.fragment());
  }

  abstract UriSchemeMapper<T> merged(UriSchemeMapper<T> that);

  @Override
  public UriMapper<T> merged(UriMapper<T> that) {
    if (that instanceof UriSchemeMapper<?>) {
      return merged((UriSchemeMapper<T>) that);
    } else {
      return that;
    }
  }

  abstract UriSchemeMapper<T> removed(UriScheme scheme, UriAuthority authority,
                                      UriPath path, UriQuery query, UriFragment fragment);

  @Override
  public UriMapper<T> removed(Uri pattern) {
    return removed(pattern.scheme(), pattern.authority(), pattern.path(),
                   pattern.query(), pattern.fragment());
  }

  abstract UriSchemeMapper<T> unmerged(UriSchemeMapper<T> that);

  @Override
  public UriMapper<T> unmerged(UriMapper<T> that) {
    if (that instanceof UriSchemeMapper<?>) {
      return unmerged((UriSchemeMapper<T>) that);
    } else {
      return this;
    }
  }

  static <T> UriSchemeMapper<T> compile(Uri pattern, UriScheme scheme, UriAuthority authority,
                                        UriPath path, UriQuery query, UriFragment fragment, T value) {
    if (scheme.isDefined()) {
      return new UriSchemeMapping<T>(HashTrieMap.<String, UriAuthorityMapper<T>>empty().updated(scheme.name(),
                                     UriAuthorityMapper.compile(pattern, authority, path, query, fragment, value)));
    } else {
      return UriAuthorityMapper.compile(pattern, authority, path, query, fragment, value);
    }
  }
}
