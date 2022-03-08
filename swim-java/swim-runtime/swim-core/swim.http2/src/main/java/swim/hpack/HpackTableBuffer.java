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

package swim.hpack;

final class HpackTableBuffer {

  HpackHeader[] headers;
  int head;
  int tail;
  int size;
  int capacity;

  HpackTableBuffer(HpackHeader[] headers, int head, int tail, int size, int capacity) {
    this.headers = headers;
    this.head = head;
    this.tail = tail;
    this.size = size;
    this.capacity = capacity;
  }

  int length() {
    int length = this.head - this.tail;
    if (length < 0) {
      length += this.headers.length;
    }
    return length;
  }

  int size() {
    return this.size;
  }

  int capacity() {
    return this.capacity;
  }

  void setCapacity(int capacity) {
    this.capacity = capacity;
    if (capacity == 0) {
      this.clear();
    } else {
      while (this.size > capacity) {
        this.remove();
      }
    }

    int maxEntries = capacity / HpackHeader.ENTRY_OVERHEAD;
    if (capacity % HpackHeader.ENTRY_OVERHEAD != 0) {
      maxEntries += 1;
    }

    final HpackHeader[] oldHeaders = this.headers;
    if (oldHeaders.length != maxEntries) {
      final HpackHeader[] newHeaders = new HpackHeader[maxEntries];
      final int n = this.length();
      int j = this.tail;
      for (int i = 0; i < n; i += 1) {
        newHeaders[i] =  oldHeaders[j];
        j += 1;
        if (j == oldHeaders.length) {
          j = 0;
        }
      }
      this.headers = newHeaders;
      this.head = n;
      this.tail = 0;
    }
  }

  HpackHeader get(int index) {
    if (index <= 0 || index > this.length()) {
      throw new IndexOutOfBoundsException(String.valueOf(index));
    }
    final int i = this.head - index;
    if (i < 0) {
      return this.headers[i + this.headers.length];
    } else {
      return this.headers[i];
    }
  }

  void add(HpackHeader header) {
    final int headerSize = header.hpackSize();
    if (headerSize > this.capacity) {
      this.clear();
    } else {
      while (this.size + headerSize > this.capacity) {
        this.remove();
      }
      this.headers[this.head] = header;
      this.head += 1;
      this.size += headerSize;
      if (this.head == this.headers.length) {
        this.head = 0;
      }
    }
  }

  HpackHeader remove() {
    final HpackHeader header = this.headers[this.tail];
    if (header != null) {
      this.headers[this.tail] = null;
      this.tail += 1;
      this.size -= header.hpackSize();
      if (this.tail == this.headers.length) {
        this.tail = 0;
      }
    }
    return header;
  }

  void clear() {
    while (this.tail != this.head) {
      this.headers[this.tail] = null;
      this.tail += 1;
      if (this.tail == this.headers.length) {
        this.tail = 0;
      }
    }
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  @Override
  public HpackTableBuffer clone() {
    final HpackHeader[] oldHeaders = this.headers;
    final int n = oldHeaders.length;
    final HpackHeader[] newHeaders = new HpackHeader[n];
    final int head = this.head;
    final int tail = this.tail;
    int cursor = tail;
    while (cursor != head) {
      newHeaders[cursor] = oldHeaders[cursor];
      cursor += 1;
      if (cursor == n) {
        cursor = 0;
      }
    }
    return new HpackTableBuffer(newHeaders, head, tail, this.size, this.capacity);
  }

  static HpackTableBuffer withCapacity(int capacity) {
    int maxEntries = capacity / HpackHeader.ENTRY_OVERHEAD;
    if (capacity % HpackHeader.ENTRY_OVERHEAD != 0) {
      maxEntries += 1;
    }
    return new HpackTableBuffer(new HpackHeader[maxEntries], 0, 0, 0, capacity);
  }

}
