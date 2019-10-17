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

abstract class UriFragmentMapper<T> extends UriQueryMapper<T> {
  abstract UriMapper<T> getSuffix(UriFragment fragment);

  @Override
  UriMapper<T> getSuffix(UriQuery query, UriFragment fragment) {
    return getSuffix(fragment);
  }

  abstract T get(UriFragment fragment);

  @Override
  T get(UriQuery query, UriFragment fragment) {
    return get(fragment);
  }

  abstract UriFragmentMapper<T> merged(UriFragmentMapper<T> that);

  @Override
  UriQueryMapper<T> merged(UriQueryMapper<T> that) {
    if (that instanceof UriFragmentMapper<?>) {
      return merged((UriFragmentMapper<T>) that);
    } else {
      return that;
    }
  }

  abstract UriFragmentMapper<T> removed(UriFragment fragment);

  @Override
  UriQueryMapper<T> removed(UriQuery query, UriFragment fragment) {
    return removed(fragment);
  }

  abstract UriFragmentMapper<T> unmerged(UriFragmentMapper<T> that);

  @Override
  UriQueryMapper<T> unmerged(UriQueryMapper<T> that) {
    if (that instanceof UriFragmentMapper<?>) {
      return unmerged((UriFragmentMapper<T>) that);
    } else {
      return this;
    }
  }

  static <T> UriFragmentMapper<T> compile(Uri pattern, UriFragment fragment, T value) {
    return UriTerminalMapper.compile(pattern, value);
  }
}
