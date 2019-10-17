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

abstract class UriTerminalMapper<T> extends UriFragmentMapper<T> {
  abstract UriMapper<T> getSuffix();

  @Override
  UriMapper<T> getSuffix(UriFragment fragment) {
    return getSuffix();
  }

  abstract T get();

  @Override
  T get(UriFragment fragment) {
    return get();
  }

  UriTerminalMapper<T> merged(UriTerminalMapper<T> that) {
    if (that.isEmpty()) {
      return this;
    } else {
      return that;
    }
  }

  @Override
  UriFragmentMapper<T> merged(UriFragmentMapper<T> that) {
    if (that instanceof UriTerminalMapper<?>) {
      return merged((UriTerminalMapper<T>) that);
    } else {
      return that;
    }
  }

  @SuppressWarnings("unchecked")
  public UriTerminalMapper<T> removed() {
    return (UriTerminalMapper<T>) empty();
  }

  @Override
  UriFragmentMapper<T> removed(UriFragment fragment) {
    return removed();
  }

  @SuppressWarnings("unchecked")
  UriTerminalMapper<T> unmerged(UriTerminalMapper<T> that) {
    return (UriTerminalMapper<T>) empty();
  }

  @Override
  UriFragmentMapper<T> unmerged(UriFragmentMapper<T> that) {
    if (that instanceof UriTerminalMapper<?>) {
      return unmerged((UriTerminalMapper<T>) that);
    } else {
      return this;
    }
  }

  static <T> UriTerminalMapper<T> compile(Uri pattern, T value) {
    return new UriConstantMapping<T>(pattern, value);
  }
}
