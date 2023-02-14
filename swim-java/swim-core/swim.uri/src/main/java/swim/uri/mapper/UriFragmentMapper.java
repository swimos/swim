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
import swim.uri.Uri;
import swim.uri.UriFragment;
import swim.uri.UriMapper;
import swim.uri.UriQuery;

@Internal
public abstract class UriFragmentMapper<T> extends UriQueryMapper<T> {

  abstract UriMapper<T> getSuffix(UriFragment fragment);

  @Override
  UriMapper<T> getSuffix(UriQuery query, UriFragment fragment) {
    return this.getSuffix(fragment);
  }

  abstract @Nullable T get(UriFragment fragment);

  @Override
  @Nullable T get(UriQuery query, UriFragment fragment) {
    return this.get(fragment);
  }

  abstract UriFragmentMapper<T> merged(UriFragmentMapper<T> that);

  @Override
  UriQueryMapper<T> merged(UriQueryMapper<T> that) {
    if (that instanceof UriFragmentMapper<?>) {
      return this.merged((UriFragmentMapper<T>) that);
    } else {
      return that;
    }
  }

  abstract UriFragmentMapper<T> removed(UriFragment fragment);

  @Override
  UriQueryMapper<T> removed(UriQuery query, UriFragment fragment) {
    return this.removed(fragment);
  }

  abstract UriFragmentMapper<T> unmerged(UriFragmentMapper<T> that);

  @Override
  UriQueryMapper<T> unmerged(UriQueryMapper<T> that) {
    if (that instanceof UriFragmentMapper<?>) {
      return this.unmerged((UriFragmentMapper<T>) that);
    } else {
      return this;
    }
  }

  public static <T> UriFragmentMapper<T> compile(Uri pattern, UriFragment fragment, T value) {
    return TerminalUriMapper.compile(pattern, value);
  }

}
