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

import org.testng.annotations.Test;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static swim.hpack.HpackAssertions.assertEncodes;
import static swim.hpack.HpackAssertions.assertEncodesBlock;

public class HpackEncoderSpec {

  @Test
  public void encodeIntegerRepresentations() {
    // RFC 7541 Section 5.1. Integer Representation
    final HpackEncoder hpack = new HpackEncoder();

    // RFC 7541 Appendix C.1.1. Example 1: Encoding 10 Using a 5-Bit Prefix
    assertEncodes(hpack.integerEncoder(0, 5, 10), Data.fromBase16("0A"));

    // RFC 7541 Appendix C.1.2. Example 2: Encoding 1337 Using a 5-Bit Prefix
    assertEncodes(hpack.integerEncoder(0, 5, 1337), Data.fromBase16("1F9A0A"));

    // RFC 7541 Appendix C.1.3. Example 3: Encoding 42 Starting at an Octet Boundary
    assertEncodes(hpack.integerEncoder(0, 8, 42), Data.fromBase16("2A"));
  }

  @Test
  public void encodeStringLiteralRepresentations() {
    // RFC 7541 Section 5.2. String Literal Representation
    final HpackEncoder hpack = new HpackEncoder();
    assertEncodes(hpack.stringEncoder("www.example.com", false),
                  Data.fromBase16("0F7777772E6578616D706C652E636F6D"));
  }

  @Test
  public void encodeStringLiteralRepresentationsWithHuffmanCoding() {
    // RFC 7541 Section 5.2. String Literal Representation
    final HpackEncoder hpack = new HpackEncoder();
    assertEncodes(hpack.stringEncoder("www.example.com", true),
                  Data.fromBase16("8CF1E3C2E5F23A6BA0AB90F4FF"));
  }

  @Test
  public void encode1ByteIndexedHeaders() {
    final HpackEncoder hpack = new HpackEncoder();
    for (int i = 1; i < 0x7F; i += 1) {
      final Data data = Data.create(1);
      data.addByte((byte) (0x80 | i));
      assertEncodes(hpack.headerEncoder(i), data);
    }
  }

  @Test
  public void encode2ByteIndexedHeaders() {
    final HpackEncoder hpack = new HpackEncoder();
    for (int i = 0x7F; i < 0xFF; i += 1) {
      final int value = i - 0x7F;
      final Data data = Data.create(2);
      data.addByte((byte) (0x80 | 0x7F));
      data.addByte((byte) (value & 0x7F));
      assertEncodes(hpack.headerEncoder(i), data);
    }
  }

  @Test
  public void encode3ByteIndexedHeaders() {
    final HpackEncoder hpack = new HpackEncoder();
    for (int i = 0xFF; i < 0x407F; i += 1) {
      final int value = i - 0x7F;
      final Data data = Data.create(3);
      data.addByte((byte) (0x80 | 0x7F));
      data.addByte((byte) (0x80 | value & 0x7F));
      data.addByte((byte) (value >> 7 & 0x7F));
      assertEncodes(hpack.headerEncoder(i), data);
    }
  }

  @Test
  public void encodeLiteralHeaders() {
    final HpackEncoder hpack = new HpackEncoder();
    assertEncodes(hpack.headerEncoder(0, hpack.stringEncoder("custom-key", false), hpack.stringEncoder("custom-header", false), HpackIndexing.INCREMENTAL),
                  Data.fromBase16("400a637573746f6d2d6b65790d637573746f6d2d686561646572"));
  }

  @Test
  public void encodeIndexedLiteralHeaders() {
    final HpackEncoder hpack = new HpackEncoder();
    assertEncodes(hpack.headerEncoder(1, null, hpack.stringEncoder("www.example.com", false), HpackIndexing.INCREMENTAL),
                  Data.fromBase16("410F7777772E6578616D706C652E636F6D"));
  }

  @Test
  public void encodeIndexedLiteralHeadersWithHuffmanCoding() {
    final HpackEncoder hpack = new HpackEncoder();
    assertEncodes(hpack.headerEncoder(1, null, hpack.stringEncoder("www.example.com", true), HpackIndexing.INCREMENTAL),
                  Data.fromBase16("418CF1E3C2E5F23A6BA0AB90F4FF"));
  }

  @Test
  public void encodeHeaders() {
    final HpackEncoder hpack = new HpackEncoder();
    assertEncodesBlock(hpack, Data.fromBase16("418CF1E3C2E5F23A6BA0AB90F4FF"),
                       HpackHeader.create(":authority", "www.example.com"));
  }

  @Test
  public void encodeRequestHeaderBlocksWithHuffmanCoding() {
    // RFC 7541 Appendix C.4. Request Examples with Huffman Coding
    final HpackEncoder hpack = new HpackEncoder();

    // RFC 7541 Appendix C.4.1. First Request
    assertEncodesBlock(hpack, Data.fromBase16("828684418CF1E3C2E5F23A6BA0AB90F4FF"),
                       HpackHeader.create(":method", "GET"),
                       HpackHeader.create(":scheme", "http"),
                       HpackHeader.create(":path", "/"),
                       HpackHeader.create(":authority", "www.example.com"));
    assertEquals(hpack.dynamicTable.length(), 1);
    assertEquals(hpack.dynamicTable.get(1), HpackHeader.create(":authority", "www.example.com"));
    assertEquals(hpack.dynamicTable.size(), 57);

    // RFC 7541 Appendix C.4.2. Second Request
    assertEncodesBlock(hpack, Data.fromBase16("828684BE5886A8EB10649CBF"),
                       HpackHeader.create(":method", "GET"),
                       HpackHeader.create(":scheme", "http"),
                       HpackHeader.create(":path", "/"),
                       HpackHeader.create(":authority", "www.example.com"),
                       HpackHeader.create("cache-control", "no-cache"));
    assertEquals(hpack.dynamicTable.length(), 2);
    assertEquals(hpack.dynamicTable.get(1), HpackHeader.create("cache-control", "no-cache"));
    assertEquals(hpack.dynamicTable.get(2), HpackHeader.create(":authority", "www.example.com"));
    assertEquals(hpack.dynamicTable.size(), 110);

    // RFC 7541 Appendix C.4.3. Third Request
    assertEncodesBlock(hpack, Data.fromBase16("828785BF408825A849E95BA97D7F8925A849E95BB8E8B4BF"),
                       HpackHeader.create(":method", "GET"),
                       HpackHeader.create(":scheme", "https"),
                       HpackHeader.create(":path", "/index.html"),
                       HpackHeader.create(":authority", "www.example.com"),
                       HpackHeader.create("custom-key", "custom-value"));
    assertEquals(hpack.dynamicTable.length(), 3);
    assertEquals(hpack.dynamicTable.get(1), HpackHeader.create("custom-key", "custom-value"));
    assertEquals(hpack.dynamicTable.get(2), HpackHeader.create("cache-control", "no-cache"));
    assertEquals(hpack.dynamicTable.get(3), HpackHeader.create(":authority", "www.example.com"));
    assertEquals(hpack.dynamicTable.size(), 164);
  }

  @Test
  public void encodeResponseHeaderBlocksWithHuffmanCoding() {
    // RFC 7541 Appendix C.6. Response Examples with Huffman Coding
    final HpackEncoder hpack = new HpackEncoder(256);

    // RFC 7541 Appendix C.6.1. First Response
    assertEncodesBlock(hpack, Data.fromBase16("488264025885AEC3771A4B6196D07ABE941054D444A8200595040B8166E082A62D1BFF6E919D29AD171863C78F0B97C8E9AE82AE43D3"),
                       HpackHeader.create(":status", "302"),
                       HpackHeader.create("cache-control", "private"),
                       HpackHeader.create("date", "Mon, 21 Oct 2013 20:13:21 GMT"),
                       HpackHeader.create("location", "https://www.example.com"));
    assertEquals(hpack.dynamicTable.length(), 4);
    assertEquals(hpack.dynamicTable.get(1), HpackHeader.create("location", "https://www.example.com"));
    assertEquals(hpack.dynamicTable.get(2), HpackHeader.create("date", "Mon, 21 Oct 2013 20:13:21 GMT"));
    assertEquals(hpack.dynamicTable.get(3), HpackHeader.create("cache-control", "private"));
    assertEquals(hpack.dynamicTable.get(4), HpackHeader.create(":status", "302"));
    assertEquals(hpack.dynamicTable.size(), 222);

    // RFC 7541 Appendix C.6.2. Second Response
    assertEncodesBlock(hpack, Data.fromBase16("4803333037C1C0BF"),
                       HpackHeader.create(":status", "307"),
                       HpackHeader.create("cache-control", "private"),
                       HpackHeader.create("date", "Mon, 21 Oct 2013 20:13:21 GMT"),
                       HpackHeader.create("location", "https://www.example.com"));
    assertEquals(hpack.dynamicTable.length(), 4);
    assertEquals(hpack.dynamicTable.get(1), HpackHeader.create(":status", "307"));
    assertEquals(hpack.dynamicTable.get(2), HpackHeader.create("location", "https://www.example.com"));
    assertEquals(hpack.dynamicTable.get(3), HpackHeader.create("date", "Mon, 21 Oct 2013 20:13:21 GMT"));
    assertEquals(hpack.dynamicTable.get(4), HpackHeader.create("cache-control", "private"));
    assertEquals(hpack.dynamicTable.size(), 222);

    // RFC 7541 Appendix C.6.3. Third Response
    assertEncodesBlock(hpack, Data.fromBase16("88C16196D07ABE941054D444A8200595040B8166E084A62D1BFFC05A839BD9AB77AD94E7821DD7F2E6C7B335DFDFCD5B3960D5AF27087F3672C1AB270FB5291F9587316065C003ED4EE5B1063D5007"),
                       HpackHeader.create(":status", "200"),
                       HpackHeader.create("cache-control", "private"),
                       HpackHeader.create("date", "Mon, 21 Oct 2013 20:13:22 GMT"),
                       HpackHeader.create("location", "https://www.example.com"),
                       HpackHeader.create("content-encoding", "gzip"),
                       HpackHeader.create("set-cookie", "foo=ASDJKHQKBZXOQWEOPIUAXQWEOIU; max-age=3600; version=1"));
    assertEquals(hpack.dynamicTable.length(), 3);
    assertEquals(hpack.dynamicTable.get(1), HpackHeader.create("set-cookie", "foo=ASDJKHQKBZXOQWEOPIUAXQWEOIU; max-age=3600; version=1"));
    assertEquals(hpack.dynamicTable.get(2), HpackHeader.create("content-encoding", "gzip"));
    assertEquals(hpack.dynamicTable.get(3), HpackHeader.create("date", "Mon, 21 Oct 2013 20:13:22 GMT"));
    assertEquals(hpack.dynamicTable.size(), 215);
  }

}
