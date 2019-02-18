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

import swim.codec.Base64;
import swim.codec.Binary;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class JsonWebSignatureWriter extends Writer<Object, JsonWebSignature> {
  final JsonWebSignature jws;
  final Writer<?, ?> part;
  final int step;

  JsonWebSignatureWriter(JsonWebSignature jws, Writer<?, ?> part, int step) {
    this.jws = jws;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, JsonWebSignature> pull(Output<?> output) {
    return write(output, jws, part, step);
  }

  static Writer<Object, JsonWebSignature> write(Output<?> output, JsonWebSignature jws,
                                                Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = Binary.writeByteBuffer(jws.signingInput.asByteBuffer(), output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 2;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('.');
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = Base64.urlUnpadded().writeByteBuffer(jws.signatureData.asByteBuffer(), output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return done(jws);
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new JsonWebSignatureWriter(jws, part, step);
  }

  static Writer<Object, JsonWebSignature> write(Output<?> output, JsonWebSignature jws) {
    return write(output, jws, null, 1);
  }
}
