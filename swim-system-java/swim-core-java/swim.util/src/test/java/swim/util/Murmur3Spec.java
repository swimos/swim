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

package swim.util;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class Murmur3Spec {
  static byte[] bytes(int... xs) {
    final byte[] bs = new byte[xs.length];
    for (int i = 0; i < xs.length; i += 1) {
      bs[i] = (byte) xs[i];
    }
    return bs;
  }

  @Test
  public void hashBytes() {
    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes())),                       0);
    assertEquals(Murmur3.mash(Murmur3.mix(1,          bytes())),                       0x514e28b7);
    assertEquals(Murmur3.mash(Murmur3.mix(0xffffffff, bytes())),                       0x81f16f39);
    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes(0xff, 0xff, 0xff, 0xff))), 0x76293b50);

    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes(0x21, 0x43, 0x65, 0x87))), 0xf55b516b);
    assertEquals(Murmur3.mash(Murmur3.mix(0x5082edee, bytes(0x21, 0x43, 0x65, 0x87))), 0x2362f9de);
    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes(0x21, 0x43, 0x65))),       0x7e4a8634);
    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes(0x21, 0x43))),             0xa0f7b07a);
    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes(0x21))),                   0x72661cf4);

    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes(0x00, 0x00, 0x00, 0x00))), 0x2362f9de);
    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes(0x00, 0x00, 0x00))),       0x85f0b427);
    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes(0x00, 0x00))),             0x30f4c306);
    assertEquals(Murmur3.mash(Murmur3.mix(0,          bytes(0x00))),                   0x514e28b7);
  }

  @Test
  public void hashStrings() {
    assertEquals(Murmur3.mash(Murmur3.mix(0,          "")),         0);
    assertEquals(Murmur3.mash(Murmur3.mix(1,          "")),         0x514e28b7);
    assertEquals(Murmur3.mash(Murmur3.mix(0xffffffff, "")),         0x81f16f39);
    assertEquals(Murmur3.mash(Murmur3.mix(0,          "\0\0\0\0")), 0x2362f9de);

    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "aaaa")),     0x5a97808a);
    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "aaa")),      0x283e0130);
    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "aa")),       0x5d211726);
    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "a")),        0x7fa09ea6);

    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "abcd")),     0xf0478627);
    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "abc")),      0xc84a62dd);
    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "ab")),       0x74875592);
    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "a")),        0x7fa09ea6);

    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "Hello, world!")), 0x24884cba);

    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "ππππππππ")), 0xd58063c1);

    assertEquals(Murmur3.mash(Murmur3.mix(0, "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")), 0xee925b90);

    assertEquals(Murmur3.mash(Murmur3.mix(0x9747b28c, "The quick brown fox jumps over the lazy dog")), 0x2fa826cd);
  }
}
