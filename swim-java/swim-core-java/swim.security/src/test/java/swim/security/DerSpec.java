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

package swim.security;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Unicode;
import swim.structure.Data;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public class DerSpec {
  @Test
  public void decodeInteger() {
    assertDecodes(Data.fromBase16("022100F3BD0C07A81FB932781ED52752F60CC89A6BE5E51934FE01938DDB55D8F77801"),
                  Num.from(new BigInteger("110246039328358150430804407946042381407500908316371398015658902487828646033409")));
  }

  @Test
  public void encodeInteger() {
    assertEncodes(Num.from(new BigInteger("110246039328358150430804407946042381407500908316371398015658902487828646033409")),
                  Data.fromBase16("022100F3BD0C07A81FB932781ED52752F60CC89A6BE5E51934FE01938DDB55D8F77801"));
  }

  @Test
  public void decodeSequence() {
    assertDecodes(Data.fromBase16("304502200ED1215379636C483C2F7F155807D402A3B228033AF97C7E17819AC3169EA665022100C50A07D38C3C70E5D8F12DAF084A5480A66590C5F293509A8F3F7F8A83A354D5"),
                  Record.of(Num.from(new BigInteger("6701880924793116756642505055823667560639889045575942907225763811788903589477")),
                            Num.from(new BigInteger("89123353657093021477366684784932901580138243670089627582817239001914975409365"))));
  }

  @Test
  public void encodeSequence() {
    assertEncodes(Record.of(Num.from(new BigInteger("6701880924793116756642505055823667560639889045575942907225763811788903589477")),
                            Num.from(new BigInteger("89123353657093021477366684784932901580138243670089627582817239001914975409365"))),
                  Data.fromBase16("304502200ED1215379636C483C2F7F155807D402A3B228033AF97C7E17819AC3169EA665022100C50A07D38C3C70E5D8F12DAF084A5480A66590C5F293509A8F3F7F8A83A354D5"));
  }

  public static <T> void assertDecodes(Decoder<T> decodee, InputBuffer input, T expected) {
    for (int i = 0, n = input.remaining(); i <= n; i += 1) {
      Decoder<?> decoder = decodee;
      assertTrue(decoder.isCont());
      assertFalse(decoder.isDone());
      assertFalse(decoder.isError());
      input = input.index(0).limit(i).isPart(true);
      decoder = decoder.feed(input);
      input = input.limit(n).isPart(false);
      decoder = decoder.feed(input);
      if (decoder.isError()) {
        throw new TestException(decoder.trap());
      }
      assertFalse(decoder.isCont());
      assertTrue(decoder.isDone());
      assertFalse(decoder.isError());
      assertEquals(decoder.bind(), expected);
    }
  }

  public static <T> void assertDecodes(Decoder<T> decodee, Data input, T expected) {
    assertDecodes(decodee, Binary.inputBuffer(input.toByteBuffer()), expected);
  }

  @SuppressWarnings("unchecked")
  public static void assertDecodes(Data data, Value value) {
    assertDecodes(Der.structureDecoder().valueDecoder(), data, value);
  }

  public static void assertEncodes(Value value, Data data) {
    final ByteBuffer expected = ByteBuffer.wrap(data.toByteArray());
    for (int i = expected.capacity(), n = expected.capacity(); i <= n; i += 1) {
      final ByteBuffer actual = ByteBuffer.allocate(n);
      OutputBuffer<?> output = Binary.outputBuffer(actual).isPart(true);
      Encoder<?, ?> encoder = Der.structureEncoder().encoder(value);
      assertTrue(encoder.isCont());
      assertFalse(encoder.isError());
      assertFalse(encoder.isDone());
      output = output.limit(i).isPart(true);
      encoder = encoder.pull(output);
      output = output.limit(n).isPart(false);
      encoder = encoder.pull(output);
      if (encoder.isError()) {
        throw new TestException(encoder.trap());
      }
      assertFalse(encoder.isCont());
      assertTrue(encoder.isDone());
      actual.flip();
      if (!actual.equals(expected)) {
        final Output<String> message = Unicode.stringOutput();
        message.write("expected ").debug(Data.from(expected)).write(" but found ").debug(Data.from(actual));
        fail(message.toString());
      }
    }
  }
}
