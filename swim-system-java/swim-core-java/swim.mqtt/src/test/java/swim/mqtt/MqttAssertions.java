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

package swim.mqtt;

import java.nio.ByteBuffer;
import org.testng.TestException;
import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Unicode;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public final class MqttAssertions {
  private MqttAssertions() {
    // stub
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
  public static <P extends MqttPacket<T>, T> void assertDecodesPacket(Decoder<T> content, Data data, P packet) {
    assertDecodes((Decoder<P>) Mqtt.standardDecoder().packetDecoder(content), data, packet);
  }

  @SuppressWarnings("unchecked")
  public static <P extends MqttPacket<?>> void assertDecodesPacket(Data data, P packet) {
    assertDecodes((Decoder<P>) Mqtt.standardDecoder().packetDecoder(Decoder.done()), data, packet);
  }

  public static void assertEncodes(Encoder<?, ?> part, ByteBuffer expected) {
    for (int i = 0, n = expected.capacity(); i <= n; i += 1) {
      final ByteBuffer actual = ByteBuffer.allocate(n);
      OutputBuffer<?> output = Binary.outputBuffer(actual).isPart(true);
      Encoder<?, ?> encoder = part;
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

  public static void assertEncodes(MqttPart part, byte... expected) {
    assertEncodes(part.mqttEncoder(), ByteBuffer.wrap(expected));
  }

  public static void assertEncodes(MqttPart part, Data expected) {
    assertEncodes(part.mqttEncoder(), ByteBuffer.wrap(expected.toByteArray()));
  }
}
