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

package swim.uri.mapper;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.collections.HashTrieMap;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriFragment;
import swim.uri.UriMapper;
import swim.uri.UriPath;
import swim.uri.UriQuery;
import swim.util.Assume;

@Internal
public abstract class UriPathMapper<T> extends UriAuthorityMapper<T> {

  abstract UriMapper<T> getSuffix(UriPath path, UriQuery query, UriFragment fragment);

  @Override
  UriMapper<T> getSuffix(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    return this.getSuffix(path, query, fragment);
  }

  abstract @Nullable T get(UriPath path, UriQuery query, UriFragment fragment);

  @Override
  @Nullable T get(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    return this.get(path, query, fragment);
  }

  abstract UriPathMapper<T> merged(UriPathMapper<T> that);

  @Override
  UriAuthorityMapper<T> merged(UriAuthorityMapper<T> that) {
    if (that instanceof UriPathMapper<?>) {
      return this.merged((UriPathMapper<T>) that);
    } else {
      return that;
    }
  }

  abstract UriPathMapper<T> removed(UriPath path, UriQuery query, UriFragment fragment);

  @Override
  UriAuthorityMapper<T> removed(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    return this.removed(path, query, fragment);
  }

  abstract UriPathMapper<T> unmerged(UriPathMapper<T> that);

  @Override
  UriAuthorityMapper<T> unmerged(UriAuthorityMapper<T> that) {
    if (that instanceof UriPathMapper<?>) {
      return this.unmerged((UriPathMapper<T>) that);
    } else {
      return this;
    }
  }

  public static <T> UriPathMapper<T> compile(Uri pattern, UriPath path, UriQuery query, UriFragment fragment, T value) {
    if (!path.isEmpty()) {
      final String segment = path.head();
      if (!segment.isEmpty() && segment.charAt(0) == ':') {
        return new UriPathMapping<T>(HashTrieMap.<String, UriPathMapper<T>>empty(), UriPathMapper.compile(pattern, path.tail(), query, fragment, value), Assume.conforms(UriMapper.empty()));
      } else {
        return new UriPathMapping<T>(HashTrieMap.<String, UriPathMapper<T>>empty().updated(segment, UriPathMapper.compile(pattern, path.tail(), query, fragment, value)), Assume.conforms(UriMapper.empty()), Assume.conforms(UriMapper.empty()));
      }
    } else {
      return new UriPathMapping<T>(HashTrieMap.<String, UriPathMapper<T>>empty(), Assume.conforms(UriMapper.empty()), UriQueryMapper.compile(pattern, query, fragment, value));
    }
  }

}
