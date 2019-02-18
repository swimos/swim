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

import java.util.Iterator;
import java.util.NoSuchElementException;

final class UriPathIterator implements Iterator<String> {
  UriPath path;

  UriPathIterator(UriPath path) {
    this.path = path;
  }

  @Override
  public boolean hasNext() {
    return !this.path.isEmpty();
  }

  @Override
  public String next() {
    final UriPath path = this.path;
    if (path.isEmpty()) {
      throw new NoSuchElementException();
    }
    final String component = path.head();
    this.path = path.tail();
    return component;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
