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

package swim.deflate;

@SuppressWarnings("checkstyle:all")
final class GzHeader implements Cloneable {
  // true if compressed data believed to be text
  boolean text;

  // modification time
  int time;

  // extra flags (not used when writing a gzip file)
  int xflags;

  // operating system
  int os;

  // pointer to extra field or Z_NULL if none
  byte[] extra;

  // extra field length (valid if extra != Z_NULL)
  int extra_len;

  // pointer to zero-terminated file name or Z_NULL
  byte[] name;

  // pointer to zero-terminated comment or Z_NULL
  byte[] comment;

  // true if there was or will be a header crc
  boolean hcrc;

  // true when done reading gzip header (not used when writing a gzip file)
  boolean done;

  GzHeader() {
    // nop
  }

  GzHeader(GzHeader from) {
    text = from.text;
    time = from.time;
    xflags = from.xflags;
    os = from.os;
    extra = from.extra;
    extra_len = from.extra_len;
    name = from.name;
    comment = from.comment;
    hcrc = from.hcrc;
    done = from.done;
  }

  @Override
  public GzHeader clone() {
    return new GzHeader(this);
  }
}
