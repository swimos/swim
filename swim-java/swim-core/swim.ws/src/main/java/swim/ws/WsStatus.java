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

package swim.ws;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Decode;
import swim.codec.DecodeException;
import swim.codec.Encode;
import swim.codec.EncodeException;
import swim.codec.InputBuffer;
import swim.codec.MediaType;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.OutputException;
import swim.codec.StringOutput;
import swim.codec.Text;
import swim.codec.Transcoder;
import swim.codec.Utf8DecodedOutput;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WsStatus implements ToSource {

  final int code;
  final String reason;

  WsStatus(int code, String reason) {
    this.code = code;
    this.reason = reason;
  }

  public int code() {
    return this.code;
  }

  public String reason() {
    return this.reason;
  }

  public Encode<?> encode(OutputBuffer<?> output) {
    return EncodeWsStatus.encode(output, this.code, this.reason, null, 1);
  }

  public Encode<?> encode() {
    return new EncodeWsStatus(this.code, this.reason, null, 1);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsStatus) {
      final WsStatus that = (WsStatus) other;
      return this.code == that.code && this.reason.equals(that.reason);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WsStatus.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.code), this.reason.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsStatus", "of")
            .appendArgument(this.code)
            .appendArgument(this.reason)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static WsStatus of(int code, @Nullable String reason) {
    return new WsStatus(code, reason != null ? reason : "");
  }

  public static WsStatus of(int code) {
    return new WsStatus(code, "");
  }

  public static Decode<WsStatus> decode(InputBuffer input) {
    return DecodeWsStatus.decode(input, 0, null, 1);
  }

  public static Decode<WsStatus> decode() {
    return new DecodeWsStatus(0, null, 1);
  }

  static final WsStatusTranscoder TRANSCODER = new WsStatusTranscoder();

  public static Transcoder<WsStatus> transcoder() {
    return TRANSCODER;
  }

}

final class DecodeWsStatus extends Decode<WsStatus> {

  final int code;
  final @Nullable Output<String> reasonOutput;
  final int step;

  DecodeWsStatus(int code, @Nullable Output<String> reasonOutput, int step) {
    this.code = code;
    this.reasonOutput = reasonOutput;
    this.step = step;
  }

  @Override
  public Decode<WsStatus> consume(InputBuffer input) {
    return DecodeWsStatus.decode(input, this.code, this.reasonOutput, this.step);
  }

  static Decode<WsStatus> decode(InputBuffer input, int code,
                                 @Nullable Output<String> reasonOutput, int step) {
    if (step == 1) {
      if (input.isCont()) {
        code = input.head() << 8;
        input.step();
        step = 2;
      } else if (input.isDone()) {
        return Decode.done(null);
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        code |= input.head();
        input.step();
        step = 3;
      } else if (input.isDone()) {
        return Decode.error(new DecodeException("invalid websocket close code"));
      }
    }
    if (step == 3) {
      if (reasonOutput == null) {
        reasonOutput = new Utf8DecodedOutput<String>(new StringOutput());
      }
      while (input.isCont()) {
        reasonOutput.write(input.head());
        if (reasonOutput.isError()) {
          return Decode.error(new DecodeException("invalid websocket close reason",
                                                  reasonOutput.getError()));
        }
        input.step();
      }
      if (input.isDone()) {
        try {
          return Decode.done(new WsStatus(code, reasonOutput.getNonNull()));
        } catch (OutputException cause) {
          return Decode.error(cause);
        }
      }
    }
    if (input.isError()) {
      return Decode.error(input.getError());
    }
    return new DecodeWsStatus(code, reasonOutput, step);
  }

}

final class EncodeWsStatus extends Encode<Object> {

  final int code;
  final String reason;
  final @Nullable Encode<?> encode;
  final int step;

  EncodeWsStatus(int code, String reason, @Nullable Encode<?> encode, int step) {
    this.code = code;
    this.reason = reason;
    this.encode = encode;
    this.step = step;
  }

  @Override
  public Encode<Object> produce(OutputBuffer<?> output) {
    return EncodeWsStatus.encode(output, this.code, this.reason,
                                 this.encode, this.step);
  }

  static Encode<Object> encode(OutputBuffer<?> output, int code, String reason,
                               @Nullable Encode<?> encode, int step) {
    if (step == 1 && output.isCont()) {
      output.write((code >>> 8) & 0xFF);
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output.write(code & 0xFF);
      step = 3;
    }
    if (step == 3) {
      if (encode == null) {
        encode = Text.transcoder().encode(output, reason);
      } else {
        encode = encode.produce(output);
      }
      if (encode.isDone()) {
        return Encode.done();
      } else if (encode.isError()) {
        return encode.asError();
      }
    }
    if (output.isDone()) {
      return Encode.error(new EncodeException("truncated encode"));
    } else if (output.isError()) {
      return Encode.error(output.getError());
    }
    return new EncodeWsStatus(code, reason, encode, step);
  }

}

final class WsStatusTranscoder implements Transcoder<WsStatus>, ToSource {

  @Override
  public MediaType mediaType() {
    return MediaType.of("application", "octet-stream");
  }

  @Override
  public Decode<WsStatus> decode(InputBuffer input) {
    return WsStatus.decode(input);
  }

  @Override
  public Decode<WsStatus> decode() {
    return WsStatus.decode();
  }

  @Override
  public Encode<?> encode(OutputBuffer<?> output, @Nullable WsStatus value) {
    if (value != null) {
      return value.encode(output);
    } else {
      return Encode.done();
    }
  }

  @Override
  public Encode<?> encode(@Nullable WsStatus value) {
    if (value != null) {
      return value.encode();
    } else {
      return Encode.done();
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsStatus", "transcoder").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
