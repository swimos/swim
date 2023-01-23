// Copyright 2015-2023 Swim.inc
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

import java.nio.charset.StandardCharsets;

final class HpackTableStatic {

  final HpackHeader[] headers;

  HpackTableStatic(HpackHeader[] headers) {
    this.headers = headers;
  }

  int length() {
    return this.headers.length;
  }

  HpackHeader get(int index) {
    return this.headers[index - 1];
  }

  int getIndex(byte[] name, byte[] value) {
    int lo = 0;
    int hi = this.headers.length - 1;
    while (lo <= hi) {
      final int mid = (lo + hi) >>> 1;
      final HpackHeader header = this.headers[mid];
      int order = -header.compareName(name);
      if (order == 0) {
        order = -header.compareValue(value);
      }
      if (order > 0) {
        lo = mid + 1;
      } else if (order < 0) {
        hi = mid - 1;
      } else {
        return mid + 1;
      }
    }
    return -1;
  }

  int getIndex(byte[] name) {
    int lo = 0;
    int hi = this.headers.length - 1;
    while (lo <= hi) {
      final int mid = (lo + hi) >>> 1;
      final HpackHeader header = this.headers[mid];
      final int order = -header.compareName(name);
      if (order > 0) {
        lo = mid + 1;
      } else if (order < 0) {
        hi = mid - 1;
      } else if (lo < hi) {
        hi = mid;
      } else {
        return mid + 1;
      }
    }
    return -1;
  }

  int getIndex(String name, String value) {
    return this.getIndex(name.getBytes(StandardCharsets.UTF_8),
                         value.getBytes(StandardCharsets.UTF_8));
  }

  int getIndex(String name) {
    return this.getIndex(name.getBytes(StandardCharsets.UTF_8));
  }

  private static HpackTableStatic standard;

  static HpackTableStatic standard() {
    if (HpackTableStatic.standard == null) {
      // RFC 7541 Appendix A
      final HpackHeader[] headers = new HpackHeader[] {
        HpackHeader.create(":authority"), // 1
        HpackHeader.create(":method", "GET"), // 2
        HpackHeader.create(":method", "POST"), // 3
        HpackHeader.create(":path", "/"), // 4
        HpackHeader.create(":path", "/index.html"), // 5
        HpackHeader.create(":scheme", "http"), // 6
        HpackHeader.create(":scheme", "https"), // 7
        HpackHeader.create(":status", "200"), // 8
        HpackHeader.create(":status", "204"), // 9
        HpackHeader.create(":status", "206"), // 10
        HpackHeader.create(":status", "304"), // 11
        HpackHeader.create(":status", "400"), // 12
        HpackHeader.create(":status", "404"), // 13
        HpackHeader.create(":status", "500"), // 14
        HpackHeader.create("accept-charset"), // 15
        HpackHeader.create("accept-encoding", "gzip, deflate"), // 16
        HpackHeader.create("accept-language"), // 17
        HpackHeader.create("accept-ranges"), // 18
        HpackHeader.create("accept"), // 19
        HpackHeader.create("access-control-allow-origin"), // 20
        HpackHeader.create("age"), // 21
        HpackHeader.create("allow"), // 22
        HpackHeader.create("authorization"), // 23
        HpackHeader.create("cache-control"), // 24
        HpackHeader.create("content-disposition"), // 25
        HpackHeader.create("content-encoding"), // 26
        HpackHeader.create("content-language"), // 27
        HpackHeader.create("content-length"), // 28
        HpackHeader.create("content-location"), // 29
        HpackHeader.create("content-range"), // 30
        HpackHeader.create("content-type"), // 31
        HpackHeader.create("cookie"), // 32
        HpackHeader.create("date"), // 33
        HpackHeader.create("etag"), // 34
        HpackHeader.create("expect"), // 35
        HpackHeader.create("expires"), // 36
        HpackHeader.create("from"), // 37
        HpackHeader.create("host"), // 38
        HpackHeader.create("if-match"), // 39
        HpackHeader.create("if-modified-since"), // 40
        HpackHeader.create("if-none-match"), // 41
        HpackHeader.create("if-range"), // 42
        HpackHeader.create("if-unmodified-since"), // 43
        HpackHeader.create("last-modified"), // 44
        HpackHeader.create("link"), // 45
        HpackHeader.create("location"), // 46
        HpackHeader.create("max-forwards"), // 47
        HpackHeader.create("proxy-authenticate"), // 48
        HpackHeader.create("proxy-authorization"), // 49
        HpackHeader.create("range"), // 50
        HpackHeader.create("referer"), // 51
        HpackHeader.create("refresh"), // 52
        HpackHeader.create("retry-after"), // 53
        HpackHeader.create("server"), // 54
        HpackHeader.create("set-cookie"), // 55
        HpackHeader.create("strict-transport-security"), // 56
        HpackHeader.create("transfer-encoding"), // 57
        HpackHeader.create("user-agent"), // 58
        HpackHeader.create("vary"), // 59
        HpackHeader.create("via"), // 60
        HpackHeader.create("www-authenticate"), // 61
      };
      HpackTableStatic.standard = new HpackTableStatic(headers);
    }
    return HpackTableStatic.standard;
  }

}
