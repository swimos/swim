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

abstract class UriAuthorityMapper<T> extends UriSchemeMapper<T> {
  abstract UriMapper<T> getSuffix(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment);

  @Override
  UriMapper<T> getSuffix(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    return getSuffix(authority, path, query, fragment);
  }

  abstract T get(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment);

  @Override
  T get(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    return get(authority, path, query, fragment);
  }

  abstract UriAuthorityMapper<T> merged(UriAuthorityMapper<T> that);

  @Override
  UriSchemeMapper<T> merged(UriSchemeMapper<T> that) {
    if (that instanceof UriAuthorityMapper<?>) {
      return merged((UriAuthorityMapper<T>) that);
    } else {
      return that;
    }
  }

  abstract UriAuthorityMapper<T> removed(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment);

  @Override
  UriSchemeMapper<T> removed(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    return removed(authority, path, query, fragment);
  }

  abstract UriAuthorityMapper<T> unmerged(UriAuthorityMapper<T> that);

  @Override
  UriSchemeMapper<T> unmerged(UriSchemeMapper<T> that) {
    if (that instanceof UriAuthorityMapper<?>) {
      return unmerged((UriAuthorityMapper<T>) that);
    } else {
      return this;
    }
  }

  static <T> UriAuthorityMapper<T> compile(Uri pattern, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment, T value) {
    return UriPathMapper.compile(pattern, path, query, fragment, value);
  }
}
