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

package swim.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Murmur3Tests {

  @Test
  public void hashBytes() {
    assertEquals(0, Murmur3.mash(Murmur3.mixByteArray(0, bytes())));
    assertEquals(0x514E28B7, Murmur3.mash(Murmur3.mixByteArray(1, bytes())));
    assertEquals(0x81F16F39, Murmur3.mash(Murmur3.mixByteArray(0xFFFFFFFF, bytes())));
    assertEquals(0x76293B50, Murmur3.mash(Murmur3.mixByteArray(0, bytes(0xFF, 0xFF, 0xFF, 0xFF))));

    assertEquals(0xF55B516B, Murmur3.mash(Murmur3.mixByteArray(0, bytes(0x21, 0x43, 0x65, 0x87))));
    assertEquals(0x2362F9DE, Murmur3.mash(Murmur3.mixByteArray(0x5082EDEE, bytes(0x21, 0x43, 0x65, 0x87))));
    assertEquals(0x7E4A8634, Murmur3.mash(Murmur3.mixByteArray(0, bytes(0x21, 0x43, 0x65))));
    assertEquals(0xA0F7B07A, Murmur3.mash(Murmur3.mixByteArray(0, bytes(0x21, 0x43))));
    assertEquals(0x72661CF4, Murmur3.mash(Murmur3.mixByteArray(0, bytes(0x21))));

    assertEquals(0x2362F9DE, Murmur3.mash(Murmur3.mixByteArray(0, bytes(0x00, 0x00, 0x00, 0x00))));
    assertEquals(0x85F0B427, Murmur3.mash(Murmur3.mixByteArray(0, bytes(0x00, 0x00, 0x00))));
    assertEquals(0x30F4C306, Murmur3.mash(Murmur3.mixByteArray(0, bytes(0x00, 0x00))));
    assertEquals(0x514E28B7, Murmur3.mash(Murmur3.mixByteArray(0, bytes(0x00))));
  }

  @Test
  public void hashStrings() {
    assertEquals(0, Murmur3.mash(Murmur3.mixString(0, "")));
    assertEquals(0x514E28B7, Murmur3.mash(Murmur3.mixString(1, "")));
    assertEquals(0x81F16F39, Murmur3.mash(Murmur3.mixString(0xFFFFFFFF, "")));
    assertEquals(0x2362F9DE, Murmur3.mash(Murmur3.mixString(0, "\0\0\0\0")));

    assertEquals(0x5A97808A, Murmur3.mash(Murmur3.mixString(0x9747B28C, "aaaa")));
    assertEquals(0x283E0130, Murmur3.mash(Murmur3.mixString(0x9747B28C, "aaa")));
    assertEquals(0x5D211726, Murmur3.mash(Murmur3.mixString(0x9747B28C, "aa")));
    assertEquals(0x7FA09EA6, Murmur3.mash(Murmur3.mixString(0x9747B28C, "a")));

    assertEquals(0xF0478627, Murmur3.mash(Murmur3.mixString(0x9747B28C, "abcd")));
    assertEquals(0xC84A62DD, Murmur3.mash(Murmur3.mixString(0x9747B28C, "abc")));
    assertEquals(0x74875592, Murmur3.mash(Murmur3.mixString(0x9747B28C, "ab")));
    assertEquals(0x7FA09EA6, Murmur3.mash(Murmur3.mixString(0x9747B28C, "a")));

    assertEquals(0x24884CBA, Murmur3.mash(Murmur3.mixString(0x9747B28C, "Hello, world!")));

    assertEquals(0xD58063C1, Murmur3.mash(Murmur3.mixString(0x9747B28C, "ππππππππ")));

    assertEquals(0xEE925B90, Murmur3.mash(Murmur3.mixString(0, "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")));

    assertEquals(0x2FA826CD, Murmur3.mash(Murmur3.mixString(0x9747B28C, "The quick brown fox jumps over the lazy dog")));
  }

  static byte[] bytes(int... xs) {
    final byte[] bs = new byte[xs.length];
    for (int i = 0; i < xs.length; i += 1) {
      bs[i] = (byte) xs[i];
    }
    return bs;
  }

}
