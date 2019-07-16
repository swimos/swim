// Based on zlib-1.2.8
// Copyright (c) 1995-2013 Jean-loup Gailly and Mark Adler
// Copyright (c) 2016-2018 Swim.it inc.
//
// This software is provided 'as-is', without any express or implied
// warranty.  In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//    claim that you wrote the original software. If you use this software
//    in a product, an acknowledgment in the product documentation would be
//    appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//    misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

package swim.deflate;

final class CRC32 {
  private CRC32() {
    // stub
  }

  static final int[] CRC_TABLE = makeCRCTable();

  // Generate tables for a byte-wise 32-bit CRC calculation on the polynomial:
  // x^32+x^26+x^23+x^22+x^16+x^12+x^11+x^10+x^8+x^7+x^5+x^4+x^2+x+1.
  static int[] makeCRCTable() {
    final int[] crcTable = new int[256];
    for (int n = 0; n < 256; n++) { // generate a crc for every 8-bit value
      int c = n;
      for (int k = 0; k < 8; k++) {
        c = (c & 1) != 0 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c;
    }
    return crcTable;
  }

  static int crc32(int crc, byte[] buffer, int offset, int length) {
    if (buffer == null) {
      return 0;
    }
    crc = ~crc;
    while (length >= 8) {
      crc = CRC_TABLE[(crc ^ buffer[offset++]) & 0xFF] ^ (crc >>> 8);
      crc = CRC_TABLE[(crc ^ buffer[offset++]) & 0xFF] ^ (crc >>> 8);
      crc = CRC_TABLE[(crc ^ buffer[offset++]) & 0xFF] ^ (crc >>> 8);
      crc = CRC_TABLE[(crc ^ buffer[offset++]) & 0xFF] ^ (crc >>> 8);
      crc = CRC_TABLE[(crc ^ buffer[offset++]) & 0xFF] ^ (crc >>> 8);
      crc = CRC_TABLE[(crc ^ buffer[offset++]) & 0xFF] ^ (crc >>> 8);
      crc = CRC_TABLE[(crc ^ buffer[offset++]) & 0xFF] ^ (crc >>> 8);
      crc = CRC_TABLE[(crc ^ buffer[offset++]) & 0xFF] ^ (crc >>> 8);
      length -= 8;
    }
    if (length != 0) {
      do {
        crc = CRC_TABLE[(crc ^ buffer[offset++]) & 0xFF] ^ (crc >>> 8);
      } while (--length != 0);
    }
    return ~crc;
  }
}
