// Copyright 2015-2023 Nstream, inc.
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
import swim.util.Assume;

@Internal
public abstract class TerminalUriMapper<T> extends UriFragmentMapper<T> {

  abstract UriMapper<T> getSuffix();

  @Override
  UriMapper<T> getSuffix(UriFragment fragment) {
    return this.getSuffix();
  }

  abstract @Nullable T get();

  @Override
  @Nullable T get(UriFragment fragment) {
    return this.get();
  }

  TerminalUriMapper<T> merged(TerminalUriMapper<T> that) {
    if (that.isEmpty()) {
      return this;
    }
    return that;
  }

  @Override
  UriFragmentMapper<T> merged(UriFragmentMapper<T> that) {
    if (that instanceof TerminalUriMapper<?>) {
      return this.merged((TerminalUriMapper<T>) that);
    }
    return that;
  }

  public TerminalUriMapper<T> removed() {
    return Assume.conforms(UriMapper.empty());
  }

  @Override
  UriFragmentMapper<T> removed(UriFragment fragment) {
    return this.removed();
  }

  TerminalUriMapper<T> unmerged(TerminalUriMapper<T> that) {
    return Assume.conforms(UriMapper.empty());
  }

  @Override
  UriFragmentMapper<T> unmerged(UriFragmentMapper<T> that) {
    if (that instanceof TerminalUriMapper<?>) {
      return this.unmerged((TerminalUriMapper<T>) that);
    }
    return this;
  }

  public static <T> TerminalUriMapper<T> compile(Uri pattern, T value) {
    return new UriMapping<T>(pattern, value);
  }

}
