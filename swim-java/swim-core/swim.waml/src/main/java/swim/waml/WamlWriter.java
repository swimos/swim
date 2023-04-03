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

package swim.waml;

import java.math.BigInteger;
import java.util.Iterator;
import java.util.Map;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.expr.Expr;
import swim.expr.ExprWriter;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.util.Assume;
import swim.util.Notation;
import swim.waml.writer.WriteWamlArray;
import swim.waml.writer.WriteWamlAttr;
import swim.waml.writer.WriteWamlBlock;
import swim.waml.writer.WriteWamlIdentifier;
import swim.waml.writer.WriteWamlInteger;
import swim.waml.writer.WriteWamlMarkup;
import swim.waml.writer.WriteWamlNumber;
import swim.waml.writer.WriteWamlObject;
import swim.waml.writer.WriteWamlString;
import swim.waml.writer.WriteWamlTerm;
import swim.waml.writer.WriteWamlTuple;
import swim.waml.writer.WriteWamlUnit;

/**
 * Factory for constructing WAML writers.
 */
@Public
@Since("5.0")
public class WamlWriter extends ExprWriter {

  protected WamlWriter(WamlWriterOptions options) {
    super(options);
  }

  @Override
  public WamlWriterOptions options() {
    return (WamlWriterOptions) this.options;
  }

  @Override
  public Write<?> writeTerm(Output<?> output, TermForm<?> form, Term term) {
    if (term instanceof Expr) {
      return this.writeExpr(output, form, (Expr) term);
    } else if (form instanceof WamlForm<?>) {
      return Assume.<WamlForm<Object>>conforms(form).write(output, term, this);
    } else {
      return Write.error(new WriteException("unsupported term: " + term));
    }
  }

  public Write<?> writeUnit(Output<?> output, WamlForm<?> form,
                            Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlUnit.write(output, this, form, attrs, null, 1);
  }

  public Write<?> writeBoolean(Output<?> output, WamlForm<?> form, boolean value,
                               Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlIdentifier.write(output, this, form, value ? "true" : "false", attrs, null, 0, 1);
  }

  public Write<?> writeNumber(Output<?> output, WamlForm<?> form, int value,
                              Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlInteger.write(output, this, form, (long) value, attrs, null, 0, 1);
  }

  public Write<?> writeNumber(Output<?> output, WamlForm<?> form, long value,
                              Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlInteger.write(output, this, form, value, attrs, null, 0, 1);
  }

  public Write<?> writeNumber(Output<?> output, WamlForm<?> form, float value,
                              Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlNumber.write(output, this, form, Float.toString(value), attrs, null, 0, 1);
  }

  public Write<?> writeNumber(Output<?> output, WamlForm<?> form, double value,
                              Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlNumber.write(output, this, form, Double.toString(value), attrs, null, 0, 1);
  }

  public Write<?> writeNumber(Output<?> output, WamlForm<?> form, BigInteger value,
                              Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlNumber.write(output, this, form, value.toString(), attrs, null, 0, 1);
  }

  public Write<?> writeIdentifier(Output<?> output, WamlForm<?> form, String value,
                                  Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlIdentifier.write(output, this, form, value, attrs, null, 0, 1);
  }

  public Write<?> writeString(Output<?> output, WamlForm<?> form, String value,
                              Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlString.write(output, this, form, value, attrs, null, 0, 0, 1);
  }

  public Write<?> writeTerm(Output<?> output, WamlForm<?> form, Term term,
                            Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlTerm.write(output, this, form, term, attrs, null, 1);
  }

  public <E> Write<?> writeArray(Output<?> output, WamlArrayForm<E, ?, ?> form,
                                 Iterator<? extends E> elements,
                                 Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlArray.write(output, this, form, elements, attrs, null, 1);
  }

  public <N> Write<?> writeMarkup(Output<?> output, WamlMarkupForm<N, ?, ?> form,
                                  Iterator<? extends N> nodes,
                                  Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlMarkup.write(output, this, form, nodes, attrs, null, null, null, false, 0, 0, 1);
  }

  public <N> Write<?> writeInlineMarkup(Output<?> output, WamlMarkupForm<N, ?, ?> form,
                                        Iterator<? extends N> nodes,
                                        Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlMarkup.write(output, this, form, nodes, attrs, null, null, null, true, 0, 0, 1);
  }

  public <K, V> Write<?> writeObject(Output<?> output, WamlObjectForm<K, V, ?, ?> form,
                                     Iterator<? extends Map.Entry<K, V>> fields,
                                     Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlObject.write(output, this, form, fields, attrs, null, null, null, 1);
  }

  public <T> Write<?> writeTuple(Output<?> output, WamlForm<T> form, T value,
                                 Iterator<? extends Map.Entry<String, ?>> attrs) {
    return WriteWamlTuple.write(output, this, form, value, attrs, null, 1);
  }

  public <L, P> Write<?> writeBlock(Output<?> output, WamlTupleForm<L, P, ?, ?> form,
                                    Iterator<? extends Map.Entry<L, P>> params) {
    return WriteWamlBlock.write(output, this, form, params, null, null, null, 1);
  }

  public <A> Write<?> writeAttr(Output<?> output, WamlAttrForm<A, ?> form,
                                String name, A args) {
    return WriteWamlAttr.write(output, this, form, name, args, null, 0, 0, 1);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Waml", "writer")
            .appendArgument(this.options)
            .endInvoke();
  }

  static final WamlWriter COMPACT = new WamlWriter(WamlWriterOptions.compact());

  static final WamlWriter READABLE = new WamlWriter(WamlWriterOptions.readable());

}
