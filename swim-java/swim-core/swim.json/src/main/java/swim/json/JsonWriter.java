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

package swim.json;

import java.math.BigInteger;
import java.util.Iterator;
import java.util.Map;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
import swim.codec.Output;
import swim.codec.Text;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.expr.Expr;
import swim.expr.ExprWriter;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.json.writer.WriteJsonArray;
import swim.json.writer.WriteJsonIdentifier;
import swim.json.writer.WriteJsonObject;
import swim.json.writer.WriteJsonString;
import swim.util.Assume;
import swim.util.Notation;

/**
 * Factory for constructing JSON writers.
 */
@Public
@Since("5.0")
public class JsonWriter extends ExprWriter {

  protected JsonWriter(JsonWriterOptions options) {
    super(options);
  }

  @Override
  public JsonWriterOptions options() {
    return (JsonWriterOptions) this.options;
  }

  @Override
  public Write<?> writeTerm(Output<?> output, TermForm<?> form, Term term) {
    if (term instanceof Expr) {
      return this.writeExpr(output, form, (Expr) term);
    } else if (form instanceof JsonForm<?>) {
      return Assume.<JsonForm<Object>>conforms(form).write(output, term, this);
    } else {
      return Write.error(new WriteException("Unsupported term: " + term));
    }
  }

  public Write<?> writeUndefined(Output<?> output) {
    return WriteJsonIdentifier.write(output, this, "undefined", 0);
  }

  public Write<?> writeNull(Output<?> output) {
    return WriteJsonIdentifier.write(output, this, "null", 0);
  }

  public Write<?> writeBoolean(Output<?> output, boolean value) {
    return WriteJsonIdentifier.write(output, this, value ? "true" : "false", 0);
  }

  public Write<?> writeNumber(Output<?> output, int value) {
    return Base10.writeInt(output, value);
  }

  public Write<?> writeNumber(Output<?> output, long value) {
    return Base10.writeLong(output, value);
  }

  public Write<?> writeNumber(Output<?> output, float value) {
    return Text.transcoder().write(output, Float.toString(value));
  }

  public Write<?> writeNumber(Output<?> output, double value) {
    return Text.transcoder().write(output, Double.toString(value));
  }

  public Write<?> writeNumber(Output<?> output, BigInteger value) {
    return Text.transcoder().write(output, value.toString());
  }

  public Write<?> writeIdentifier(Output<?> output, String value) {
    return WriteJsonIdentifier.write(output, this, value, 0);
  }

  public Write<?> writeString(Output<?> output, String value) {
    return WriteJsonString.write(output, value, 0, 0, 1);
  }

  public <E> Write<?> writeArray(Output<?> output, JsonArrayForm<E, ?, ?> form,
                                 Iterator<? extends E> elements) {
    return WriteJsonArray.write(output, this, form, elements, null, 1);
  }

  public <K, V> Write<?> writeObject(Output<?> output, JsonObjectForm<K, V, ?, ?> form,
                                     Iterator<? extends Map.Entry<K, V>> fields) {
    return WriteJsonObject.write(output, this, form, fields, null, null, null, 1);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Json", "writer")
            .appendArgument(this.options)
            .endInvoke();
  }

  static final JsonWriter COMPACT = new JsonWriter(JsonWriterOptions.compact());

  static final JsonWriter READABLE = new JsonWriter(JsonWriterOptions.readable());

}
