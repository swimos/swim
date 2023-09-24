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

package swim.json;

import java.math.BigInteger;
import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
import swim.codec.Output;
import swim.codec.Text;
import swim.codec.Write;

@Public
@Since("5.0")
public interface JsonNumberWriter<@Contravariant T> extends JsonWriter<T> {

  @Nullable Number intoNumber(@Nullable T value) throws JsonException;

  @Override
  default Write<?> write(Output<?> output, @Nullable T value, JsonWriterOptions options) {
    final Number number;
    try {
      number = this.intoNumber(value);
    } catch (JsonException cause) {
      return Write.error(cause);
    }
    if (number == null) {
      return this.writeNull(output);
    }
    return this.writeNumber(output, number);
  }

  default Write<?> writeInt(Output<?> output, int number) {
    return Base10.writeInt(output, number);
  }

  default Write<?> writeLong(Output<?> output, long number) {
    return Base10.writeLong(output, number);
  }

  default Write<?> writeFloat(Output<?> output, float number) {
    return Text.write(output, Float.toString(number));
  }

  default Write<?> writeDouble(Output<?> output, double number) {
    return Text.write(output, Double.toString(number));
  }

  default Write<?> writeBigInteger(Output<?> output, BigInteger number) {
    return Text.write(output, number.toString());
  }

  default Write<?> writeNumber(Output<?> output, Number number) {
    return Text.write(output, number.toString());
  }

}
