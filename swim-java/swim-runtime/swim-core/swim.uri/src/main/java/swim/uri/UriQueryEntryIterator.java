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

package swim.uri;

import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;

final class UriQueryEntryIterator implements Iterator<Map.Entry<String, String>> {

  UriQuery query;

  UriQueryEntryIterator(UriQuery query) {
    this.query = query;
  }

  @Override
  public boolean hasNext() {
    return !this.query.isEmpty();
  }

  @Override
  public Map.Entry<String, String> next() {
    final UriQuery query = this.query;
    if (query.isEmpty()) {
      throw new NoSuchElementException();
    }
    final Map.Entry<String, String> param = query.head();
    this.query = query.tail();
    return param;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }

}
