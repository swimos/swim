// Copyright 2015-2021 Swim inc.
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

import {Spec, Test, Exam} from "@swim/unit";
import {Murmur3} from "@swim/util";

function bytes(...xs: number[]): Uint8Array {
  const bs = new Uint8Array(xs.length);
  for (let i = 0; i < xs.length; i += 1) {
    bs[i] = xs[i]!;
  }
  return bs;
}

export class Murmur3Spec extends Spec {
  @Test
  hashBytes(exam: Exam): void {
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes())),                       0);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(1,          bytes())),                       0x514e28b7);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0xffffffff, bytes())),                       0x81f16f39);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes(0xff, 0xff, 0xff, 0xff))), 0x76293b50);

    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes(0x21, 0x43, 0x65, 0x87))), 0xf55b516b);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0x5082edee, bytes(0x21, 0x43, 0x65, 0x87))), 0x2362f9de);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes(0x21, 0x43, 0x65))),       0x7e4a8634);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes(0x21, 0x43))),             0xa0f7b07a);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes(0x21))),                   0x72661cf4);

    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes(0x00, 0x00, 0x00, 0x00))), 0x2362f9de);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes(0x00, 0x00, 0x00))),       0x85f0b427);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes(0x00, 0x00))),             0x30f4c306);
    exam.equal(Murmur3.mash(Murmur3.mixUint8Array(0,          bytes(0x00))),                   0x514e28b7);
  }

  @Test
  hashStrings(exam: Exam): void {
    exam.equal(Murmur3.mash(Murmur3.mixString(0,          "")),         0);
    exam.equal(Murmur3.mash(Murmur3.mixString(1,          "")),         0x514e28b7);
    exam.equal(Murmur3.mash(Murmur3.mixString(0xffffffff, "")),         0x81f16f39);
    exam.equal(Murmur3.mash(Murmur3.mixString(0,          "\0\0\0\0")), 0x2362f9de);

    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "aaaa")),     0x5a97808a);
    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "aaa")),      0x283e0130);
    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "aa")),       0x5d211726);
    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "a")),        0x7fa09ea6);

    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "abcd")),     0xf0478627);
    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "abc")),      0xc84a62dd);
    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "ab")),       0x74875592);
    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "a")),        0x7fa09ea6);

    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "Hello, world!")), 0x24884cba);

    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "ππππππππ")), 0xd58063c1);

    exam.equal(Murmur3.mash(Murmur3.mixString(0, "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")), 0xee925b90);

    exam.equal(Murmur3.mash(Murmur3.mixString(0x9747b28c, "The quick brown fox jumps over the lazy dog")), 0x2fa826cd);
  }
}
