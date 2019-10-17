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

abstract class UriQueryMapper<T> extends UriPathMapper<T> {
  abstract UriMapper<T> getSuffix(UriQuery query, UriFragment fragment);

  @Override
  UriMapper<T> getSuffix(UriPath path, UriQuery query, UriFragment fragment) {
    if (path.isEmpty()) {
      return getSuffix(query, fragment);
    } else {
      return UriMapper.empty();
    }
  }

  abstract T get(UriQuery query, UriFragment fragment);

  @Override
  T get(UriPath path, UriQuery query, UriFragment fragment) {
    if (path.isEmpty()) {
      return get(query, fragment);
    } else {
      return null;
    }
  }

  abstract UriQueryMapper<T> merged(UriQueryMapper<T> that);

  @Override
  UriPathMapper<T> merged(UriPathMapper<T> that) {
    if (that instanceof UriQueryMapper<?>) {
      return merged((UriQueryMapper<T>) that);
    } else {
      return that;
    }
  }

  abstract UriQueryMapper<T> removed(UriQuery query, UriFragment fragment);

  @Override
  UriPathMapper<T> removed(UriPath path, UriQuery query, UriFragment fragment) {
    if (path.isEmpty()) {
      return removed(query, fragment);
    } else {
      return this;
    }
  }

  abstract UriQueryMapper<T> unmerged(UriQueryMapper<T> that);

  @Override
  UriPathMapper<T> unmerged(UriPathMapper<T> that) {
    if (that instanceof UriQueryMapper<?>) {
      return unmerged((UriQueryMapper<T>) that);
    } else {
      return this;
    }
  }

  static <T> UriQueryMapper<T> compile(Uri pattern, UriQuery query, UriFragment fragment, T value) {
    return UriFragmentMapper.compile(pattern, fragment, value);
  }
}
