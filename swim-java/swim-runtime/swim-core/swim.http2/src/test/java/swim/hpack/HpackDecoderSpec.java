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

package swim.hpack;

import org.testng.annotations.Test;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static swim.hpack.HpackAssertions.assertDecodes;
import static swim.hpack.HpackAssertions.assertDecodesBlock;

public class HpackDecoderSpec {

  @Test
  public void decodeStaticIndexedHeaders() {
    final HpackDecoder hpack = new HpackDecoder();
    for (int i = 1; i <= hpack.staticTable.length(); i += 1) {
      final Data data = Data.create(1);
      data.addByte((byte) (0x80 | i));
      assertDecodes(hpack.headerDecoder(), data, hpack.staticTable.get(i));
    }
  }

  @Test
  public void decode1ByteDynamicIndexedHeaders() {
    final HpackDecoder hpack = new HpackDecoder();
    for (int i = 1; i <= 65; i += 1) {
      hpack.dynamicTable.add(HpackHeader.create("foo" + i, "bar"));
      for (int j = 1; j <= i; j += 1) {
        final Data data = Data.create(1);
        data.addByte((byte) (0x80 | hpack.staticTable.length() + j));
        assertDecodes(hpack.headerDecoder(), data, HpackHeader.create("foo" + (i - j + 1), "bar"));
      }
    }
  }

  @Test
  public void decode2ByteDynamicIndexedHeaders() {
    final HpackDecoder hpack = new HpackDecoder(1 << 20);
    for (int i = 1; i <= 65; i += 1) {
      hpack.dynamicTable.add(HpackHeader.create("foo" + i, "bar"));
    }

    for (int i = 66; i <= 193; i += 1) {
      hpack.dynamicTable.add(HpackHeader.create("foo" + i, "bar"));

      // Decode all existing entries
      for (int j = 1; j <= i; j += 1) {
        final Data data = Data.create(2);
        if (j <= 65) {
          data.addByte((byte) (0x80 | hpack.staticTable.length() + j));
        } else {
          final int biased = hpack.staticTable.length() + j - 0x7F;
          data.addByte((byte) 0xFF);
          data.addByte((byte) biased);
        }
        assertDecodes(hpack.headerDecoder(), data, HpackHeader.create("foo" + (i - j + 1), "bar"));
      }
    }
  }

  @Test
  public void decode3ByteDynamicIndexedHeaders() {
    final HpackDecoder hpack = new HpackDecoder(1 << 22);
    for (int i = 1; i <= 65; i += 1) {
      hpack.dynamicTable.add(HpackHeader.create("foo" + i, "bar"));
    }

    for (int i = 66; i <= (1 << 16) - 1 - hpack.staticTable.length() + 0x7F; i += 1) {
      hpack.dynamicTable.add(HpackHeader.create("foo" + i, "bar"));

      // Decode newest entry
      Data data = Data.create(1);
      data.addByte((byte) (0x80 | hpack.staticTable.length() + 1));
      assertDecodes(hpack.headerDecoder(), data, HpackHeader.create("foo" + i, "bar"));

      // Decode oldest entry
      data = Data.create(2);
      final int biased = hpack.staticTable.length() + i - 0x7F;
      data.addByte((byte) 0xFF);
      if (i <= (1 << 7) - 1 - hpack.staticTable.length() + 0x7F) {
        data.addByte((byte) biased);
      } else if (i <= (1 << 14) - 1 - hpack.staticTable.length() + 0x7F) {
        data.addByte((byte) (0x80 | biased & 0x7F));
        data.addByte((byte) (biased >>> 7 & 0x7F));
      } else if (i <= (1 << 21) - 1 - hpack.staticTable.length() + 0x7F) {
        data.addByte((byte) (0x80 | biased & 0x7F));
        data.addByte((byte) (0x80 | biased >>> 7 & 0x7F));
        data.addByte((byte) (biased >>> 14 & 0x7F));
      }
      assertDecodes(hpack.headerDecoder(), data, HpackHeader.create("foo1", "bar"));
    }
  }

  @Test
  public void decodeLiteralHeaders() {
    final HpackDecoder hpack = new HpackDecoder();
    assertDecodes(hpack.headerDecoder(), Data.fromBase16("400a637573746f6d2d6b65790d637573746f6d2d686561646572"),
                  HpackHeader.create("custom-key", "custom-header"));
  }

  @Test
  public void decodeStaticIndexedLiteralHeaders() {
    final HpackDecoder hpack = new HpackDecoder();
    assertDecodes(hpack.headerDecoder(), Data.fromBase16("410F7777772E6578616D706C652E636F6D"),
                  HpackHeader.create(":authority", "www.example.com"));
  }

  @Test
  public void decodeStaticIndexedLiteralHeadersWithHuffmanCoding() {
    final HpackDecoder hpack = new HpackDecoder();
    assertDecodes(hpack.headerDecoder(), Data.fromBase16("418CF1E3C2E5F23A6BA0AB90F4FF"),
                  HpackHeader.create(":authority", "www.example.com"));
  }

  @Test
  public void decodeRequestHeaderBlocksWithoutHuffmanCoding() {
    // RFC 7541 Appendix C.3. Request Examples without Huffman Coding
    final HpackDecoder hpack = new HpackDecoder();

    // RFC 7541 Appendix C.3.1. First Request
    assertDecodesBlock(hpack, Data.fromBase16("828684410F7777772E6578616D706C652E636F6D"),
                       HpackHeader.create(":method", "GET"),
                       HpackHeader.create(":scheme", "http"),
                       HpackHeader.create(":path", "/"),
                       HpackHeader.create(":authority", "www.example.com"));
    assertEquals(hpack.dynamicTable.length(), 1);
    assertEquals(hpack.dynamicTable.get(1), HpackHeader.create(":authority", "www.example.com"));
    assertEquals(hpack.dynamicTable.size(), 57);

    // RFC 7541 Appendix C.3.2. Second Request
    assertDecodesBlock(hpack, Data.fromBase16("828684BE58086E6F2D6361636865"),
                       HpackHeader.create(":method", "GET"),
                       HpackHeader.create(":scheme", "http"),
                       HpackHeader.create(":path", "/"),
                       HpackHeader.create(":authority", "www.example.com"),
                       HpackHeader.create("cache-control", "no-cache"));
    assertEquals(hpack.dynamicTable.length(), 2);
    assertEquals(hpack.dynamicTable.get(1), HpackHeader.create("cache-control", "no-cache"));
    assertEquals(hpack.dynamicTable.get(2), HpackHeader.create(":authority", "www.example.com"));
    assertEquals(hpack.dynamicTable.size(), 110);

    // RFC 7541 Appendix C.3.3. Third Request
    assertDecodesBlock(hpack, Data.fromBase16("828785BF400A637573746F6D2D6B65790C637573746F6D2D76616C7565"),
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
  public void decodeRequestHeaderBlocksWithHuffmanCoding() {
    // RFC 7541 Appendix C.4. Request Examples with Huffman Coding
    final HpackDecoder hpack = new HpackDecoder();

    // RFC 7541 Appendix C.4.1. First Request
    assertDecodesBlock(hpack, Data.fromBase16("828684418CF1E3C2E5F23A6BA0AB90F4FF"),
                       HpackHeader.create(":method", "GET"),
                       HpackHeader.create(":scheme", "http"),
                       HpackHeader.create(":path", "/"),
                       HpackHeader.create(":authority", "www.example.com"));
    assertEquals(hpack.dynamicTable.length(), 1);
    assertEquals(hpack.dynamicTable.get(1), HpackHeader.create(":authority", "www.example.com"));
    assertEquals(hpack.dynamicTable.size(), 57);

    // RFC 7541 Appendix C.4.2. Second Request
    assertDecodesBlock(hpack, Data.fromBase16("828684BE5886A8EB10649CBF"),
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
    assertDecodesBlock(hpack, Data.fromBase16("828785BF408825A849E95BA97D7F8925A849E95BB8E8B4BF"),
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
  public void decodeResponseHeaderBlocksWithoutHuffmanCoding() {
    // RFC 7541 Appendix C.5. Response Examples without Huffman Coding
    final HpackDecoder hpack = new HpackDecoder(256);

    // RFC 7541 Appendix C.5.1. First Response
    assertDecodesBlock(hpack, Data.fromBase16("4803333032580770726976617465611D4D6F6E2C203231204F637420323031332032303A31333A323120474D546E1768747470733A2F2F7777772E6578616D706C652E636F6D"),
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

    // RFC 7541 Appendix C.5.2. Second Response
    assertDecodesBlock(hpack, Data.fromBase16("4803333037C1C0BF"),
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

    // RFC 7541 Appendix C.5.3. Third Response
    assertDecodesBlock(hpack, Data.fromBase16("88C1611D4D6F6E2C203231204F637420323031332032303A31333A323220474D54C05A04677A69707738666F6F3D4153444A4B48514B425A584F5157454F50495541585157454F49553B206D61782D6167653D333630303B2076657273696F6E3D31"),
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

  @Test
  public void decodeResponseHeaderBlocksWithHuffmanCoding() {
    // RFC 7541 Appendix C.6. Response Examples with Huffman Coding
    final HpackDecoder hpack = new HpackDecoder(256);

    // RFC 7541 Appendix C.6.1. First Response
    assertDecodesBlock(hpack, Data.fromBase16("488264025885AEC3771A4B6196D07ABE941054D444A8200595040B8166E082A62D1BFF6E919D29AD171863C78F0B97C8E9AE82AE43D3"),
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
    assertDecodesBlock(hpack, Data.fromBase16("4883640EFFC1C0BF"),
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
    assertDecodesBlock(hpack, Data.fromBase16("88C16196D07ABE941054D444A8200595040B8166E084A62D1BFFC05A839BD9AB77AD94E7821DD7F2E6C7B335DFDFCD5B3960D5AF27087F3672C1AB270FB5291F9587316065C003ED4EE5B1063D5007"),
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
